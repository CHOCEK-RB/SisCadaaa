import {
  Controller,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Patch,
  Param,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PaginatedUsersDto } from "src/users/application/dto/paginated-users.dto";
import { RolesGuard } from "src/auth/presentation/guards/roles.guard";
import { Roles } from "src/auth/presentation/decorators/roles.decorator";
import { Role } from "src/users/domain/aggregates/role.enum";
import { StudentService } from "../../application/services/student.service";
import { UpdateStudentDto } from "../../application/dto/update-student.dto";

@Controller("students")
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

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
    return this.studentService.findAll({
      searchQuery,
      page,
      limit,
      sortBy,
      order,
    });
  }

  @Patch(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADMIN, Role.SECRETARY)
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADMIN, Role.SECRETARY)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.studentService.remove(id);
  }
}
