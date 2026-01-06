import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { UserService } from "../../application/services/user.service";
import { AnyProfileDTO } from "../../application/mappers/user.mapper";
import { PreRegisterUserDto } from "../../application/dto/pre-register-user.dto";
import { GetUser } from "../decorators/get_user.decorator";
import type { JwtPayload } from "src/auth/domain/interfaces/jwt-payload.interface";
import { PaginatedUsersDto } from "src/users/application/dto/paginated-users.dto";
import { RolesGuard } from "src/auth/presentation/guards/roles.guard";
import { Roles } from "src/auth/presentation/decorators/roles.decorator";
import { Role } from "src/users/domain/aggregates/role.enum";

/**
 * @class UsersController
 * @description
 * Controller responsible for handling user-related HTTP requests.
 */
@Controller("user")
export class UsersController {
  /**
   * @constructor
   * @param {UserService} userService - Service for managing user business logic.
   */
  constructor(private readonly userService: UserService) {}

  /**
   * @method findAll
   * @description
   * Retrieves a paginated and filtered list of users. Access restricted to Admins and Secretaries.
   * @param {string} role - The role to filter by.
   * @param {string} searchQuery - The search term.
   * @param {number} page - The page number for pagination.
   * @param {number} limit - The number of items per page.
   * @param {string} sortBy - The field to sort by.
   * @param {'ASC' | 'DESC'} order - The sort order.
   * @returns {Promise<PaginatedUsersDto>} A paginated list of users.
   */
  @Get()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADMIN, Role.SECRETARY)
  async findAll(
    @Query("role") role?: string,
    @Query("searchQuery") searchQuery?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query("sortBy", new DefaultValuePipe("user.email")) sortBy?: string,
    @Query("order", new DefaultValuePipe("DESC")) order?: "ASC" | "DESC",
  ): Promise<PaginatedUsersDto> {
    return this.userService.findAll({
      role,
      searchQuery,
      page,
      limit,
      sortBy,
      order,
    });
  }

  /**
   * @method getMyProfile
   * @description
   * Retrieves the profile of the authenticated user.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<AnyProfileDTO>} A promise that resolves to a DTO representing the user's profile.
   */
  @Get("profile")
  @UseGuards(AuthGuard("jwt"))
  async getMyProfile(@GetUser() user: JwtPayload): Promise<AnyProfileDTO> {
    return await this.userService.getUserProfile(user.sub);
  }

  /**
   * @method preRegisterUser
   * @description
   * Pre-registers a new user in the system.
   * @param {PreRegisterUserDto} preRegisterUserDto - DTO for pre-registration.
   * @returns {Promise<User>} A promise that resolves to the pre-registered user.
   */
  @Post("pre-register")
  @HttpCode(HttpStatus.CREATED)
  preRegisterUser(@Body() preRegisterUserDto: PreRegisterUserDto) {
    return this.userService.preRegisterUser(preRegisterUserDto);
  }

  /**
   * @method activateUser
   * @description
   * Activates a user account using their user ID.
   * @param {string} userId - The UUID of the user to activate.
   * @returns {Promise<User>} A promise that resolves to the activated user.
   */
  @Patch(":id/activate")
  @HttpCode(HttpStatus.OK)
  activateUser(@Param("id") userId: string) {
    return this.userService.activateUser(userId);
  }
}
