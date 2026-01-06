import {
  Controller,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PaginatedUsersDto } from "src/users/application/dto/paginated-users.dto";
import { RolesGuard } from "src/auth/presentation/guards/roles.guard";
import { Roles } from "src/auth/presentation/decorators/roles.decorator";
import { Role } from "src/users/domain/aggregates/role.enum";
import { TeacherService } from "../../application/services/teacher.service";

@Controller("teachers")
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADMIN, Role.SECRETARY)
  async findAll(
    @Query("searchQuery") searchQuery?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query("sortBy") sortBy?: string,
    @Query("order") order?: "ASC" | "DESC",
  ): Promise<PaginatedUsersDto> {
    return this.teacherService.findAll({
      searchQuery,
      page,
      limit,
      sortBy,
      order,
    });
  }
}
