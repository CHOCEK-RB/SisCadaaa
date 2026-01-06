import {
  Controller,
  Get,
  UseGuards,
  Param,
  ParseUUIDPipe,
  Patch,
  Body,
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";

import { GetUser } from "src/users/presentation/decorators/get_user.decorator";

import type { JwtPayload } from "src/auth/domain/interfaces/jwt-payload.interface";

import {
  GroupsService,
  GroupsForPeriods,
  GroupGradesResponse,
  type UpdateGradeDto,
} from "../../application/services/groups.service";
import { AcademicGroupDTO } from "../../application/dto/academic_group.dto";
import { AcademicCourseDTO } from "src/courses/application/dto/academic_course.dto";

import { GradingPeriodActiveGuard } from "src/enrollment/presentation/guards/grading-period-active.guard";

/**
 * @class GroupsController
 * @description
 * Controller responsible for managing academic groups, teacher schedules, course details, and student grades.
 * It provides endpoints for retrieving group information for teachers, schedules, academic course details,
 * and managing student grades within groups. All endpoints are protected by JWT authentication.
 */
@Controller("groups")
@UseGuards(AuthGuard("jwt"))
export class GroupsController {
  /**
   * @constructor
   * @param {GroupsService} groupsService - Service for handling business logic related to academic groups.
   */
  constructor(private readonly groupsService: GroupsService) {}

  /**
   * @method getAllGroupsForTeacher
   * @description
   * Retrieves all academic groups associated with the authenticated teacher.
   * @param {JwtPayload} user - The authenticated teacher's JWT payload containing user information.
   * @returns {Promise<GroupsForPeriods>} A promise that resolves to an object containing grouped academic groups.
   */
  @Get("/teacher")
  @UseGuards(AuthGuard("jwt"))
  async getAllGroupsForTeacher(
    @GetUser() user: JwtPayload,
  ): Promise<GroupsForPeriods> {
    return await this.groupsService.getAllGroupsForTeacher(user);
  }

  /**
   * @method getTeacherSchedule
   * @description
   * Fetches the complete academic schedule for the authenticated teacher.
   * @param {JwtPayload} user - The authenticated teacher's JWT payload.
   * @returns {Promise<AcademicGroupDTO[]>} A promise that resolves to an array of academic group DTOs representing the teacher's schedule.
   */
  @Get("/teacher/my-schedule")
  @UseGuards(AuthGuard("jwt"))
  async getTeacherSchedule(
    @GetUser() user: JwtPayload,
  ): Promise<AcademicGroupDTO[]> {
    return await this.groupsService.getTeacherSchedule(user);
  }

  /**
   * @method getSchedule
   * @description
   * Retrieves the schedule for a specific academic group by its ID.
   * @param {string} id - The UUID of the academic group.
   * @returns {Promise<AcademicGroupDTO[]>} A promise that resolves to an array of academic group DTOs for the specified group.
   */
  @Get("/schedule/:id")
  @UseGuards(AuthGuard("jwt"))
  async getSchedule(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<AcademicGroupDTO[]> {
    return await this.groupsService.getSchedule(id);
  }

  /**
   * @method getAcademicCourse
   * @description
   * Fetches details of a specific academic course by its ID.
   * @param {string} id - The UUID of the academic course.
   * @returns {Promise<AcademicCourseDTO>} A promise that resolves to the academic course DTO.
   */
  @Get("/course/:id")
  @UseGuards(AuthGuard("jwt"))
  async getAcademicCourse(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<AcademicCourseDTO> {
    return await this.groupsService.getAcademicCourse(id);
  }

  /**
   * @method getGroupGrades
   * @description
   * Retrieves grades for all students within a specific academic group.
   * @param {string} id - The UUID of the academic group.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<GroupGradesResponse>} A promise that resolves to a DTO containing group grades information.
   */
  @Get("/:id/grades")
  @UseGuards(AuthGuard("jwt"))
  async getGroupGrades(
    @Param("id", ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayload,
  ): Promise<GroupGradesResponse> {
    return await this.groupsService.getGroupGrades(id, user);
  }

  /**
   * @method updateStudentGrades
   * @description
   * Updates the grade for a single student within a specific academic group.
   * This endpoint is protected by `GradingPeriodActiveGuard` to ensure grade updates are only possible during active grading periods.
   * @param {string} id - The UUID of the academic group.
   * @param {UpdateGradeDto} updateDto - DTO containing the student ID and the new grade.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<void>} A promise that resolves when the grade has been updated.
   */
  @Patch("/:id/grades")
  //@UseGuards(AuthGuard('jwt'), GradingPeriodActiveGuard)
  @UseGuards(AuthGuard("jwt"))
  async updateStudentGrades(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateGradeDto,
    @GetUser() user: JwtPayload,
  ): Promise<void> {
    return await this.groupsService.updateStudentGrades(id, updateDto, user);
  }

  /**
   * @method updateMultipleGrades
   * @description
   * Updates grades for multiple students within a specific academic group.
   * This endpoint is protected by `GradingPeriodActiveGuard` to ensure grade updates are only possible during active grading periods.
   * @param {string} id - The UUID of the academic group.
   * @param {UpdateGradeDto[]} update - An array of DTOs, each containing a student ID and a new grade.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<void>} A promise that resolves when the grades have been updated.
   */
  @Patch("/:id/grades/bulk")
  //@UseGuards(AuthGuard('jwt'), GradingPeriodActiveGuard)
  @UseGuards(AuthGuard("jwt"))
  async updateMultipleGrades(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() update: UpdateGradeDto[],
    @GetUser() user: JwtPayload,
  ) {
    await this.groupsService.updateMultipleGrades(id, update, user);
    return { success: true, message: "Notas actualizadas correctamente" };
  }
}
