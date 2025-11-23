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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserService } from '../../application/services/user.service';
import { AnyProfileDTO } from '../../application/mappers/user.mapper';
import { PreRegisterUserDto } from '../../application/dto/pre-register-user.dto';
import { GetUser } from '../decorators/get_user.decorator';
import type { JwtPayload } from 'src/auth/domain/interfaces/jwt-payload.interface';

/**
 * @class UsersController
 * @description
 * Controller responsible for handling user-related HTTP requests, including
 * retrieving user profiles, pre-registering users, and activating user accounts.
 */
@Controller('user')
export class UsersController {
  /**
   * @constructor
   * @param {UserService} userService - Service for managing user business logic.
   */
  constructor(private readonly userService: UserService) {}

  /**
   * @method getMyProfile
   * @description
   * Retrieves the profile of the authenticated user.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<AnyProfileDTO>} A promise that resolves to a DTO representing the user's profile.
   */
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getMyProfile(@GetUser() user: JwtPayload): Promise<AnyProfileDTO> {
    return await this.userService.getUserProfile(user.sub);
  }

  /**
   * @method preRegisterUser
   * @description
   * Pre-registers a new user in the system. This typically creates a placeholder user
   * account that can be activated later.
   * @param {PreRegisterUserDto} preRegisterUserDto - DTO containing the necessary data for pre-registration (e.g., email).
   * @returns {Promise<User>} A promise that resolves to the pre-registered user entity.
   */
  @Post('pre-register')
  @HttpCode(HttpStatus.CREATED)
  preRegisterUser(@Body() preRegisterUserDto: PreRegisterUserDto) {
    return this.userService.preRegisterUser(preRegisterUserDto);
  }

  /**
   * @method activateUser
   * @description
   * Activates a user account using their user ID.
   * @param {string} userId - The UUID of the user to activate.
   * @returns {Promise<User>} A promise that resolves to the activated user entity.
   */
  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  activateUser(@Param('id') userId: string) {
    return this.userService.activateUser(userId);
  }
}
