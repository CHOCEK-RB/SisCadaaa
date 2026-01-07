import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Param,
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";

import { EnrollmentQueryService } from "../../application/services/enrollment-query.service";
import { EnrollmentLabGroupService } from "../../application/services/enrollment-lab-group.service";
import { GroupedEnrollmentsResponseDto } from "../../application/dto/grouped-enrollments-response.dto";
import { GradesAndPercentResponseDto } from "../../application/dto/grades-and-percent-response.dto";
import { GradesAndSchemeDTO } from "../../application/dto/grades-and-scheme.dto";
import { GlobalEventService } from "src/events/application/global_event.service";
import { GetUser } from "src/users/presentation/decorators/get_user.decorator";
import type { JwtPayload } from "src/auth/domain/interfaces/jwt-payload.interface";
import { AcademicCourseDTO } from "src/courses/application/dto/academic_course.dto";
import { LabEnrollmentActiveGuard } from "../guards/lab-enrollment-active.guard";
import { EnrollLabGroupDto } from "../../application/dto/enrollment.dto";
import { EventType } from "src/events/domain/aggregates/global_event.entity";
import { Roles } from "src/auth/presentation/decorators/roles.decorator";
import { RolesGuard } from "src/auth/presentation/guards/roles.guard";
import { Role } from "src/users/domain/aggregates/role.enum";
/**
 * @class EnrollmentController
 * @description
 * Controller responsible for handling general enrollment operations and academic period status checks.
 * It provides endpoints for fetching enrolled courses, grades, schedules, enrolling in lab groups,
 * and checking the status of various academic periods (e.g., lab enrollment, general academic, grading).
 * All endpoints are protected by JWT authentication.
 */
@Controller("enrollments")
@UseGuards(AuthGuard("jwt"))
export class EnrollmentController {
  /**
   * @constructor
   * @param {EnrollmentQueryService} enrollmentQueryService - Service for querying enrollment-related data.
   * @param {EnrollmentLabGroupService} enrollmentLabGroupService - Service for handling operations related to enrolling in lab groups.
   * @param {GlobalEventService} eventService - Service for checking the status of global academic events.
   */
  constructor(
    private readonly enrollmentQueryService: EnrollmentQueryService,
    private readonly enrollmentLabGroupService: EnrollmentLabGroupService,
    private readonly eventService: GlobalEventService,
  ) {}

  /**
   * @method getMyGroupedCourses
   * @description
   * Retrieves the authenticated user's enrolled courses, grouped by academic period.
   * @param {JwtPayload} user - The authenticated user's JWT payload containing user information.
   * @returns {Promise<GroupedEnrollmentsResponseDto>} A promise that resolves to a DTO containing grouped enrollment information.
   */
  @Get("my-courses")
  @UseGuards(AuthGuard("jwt"))
  async getMyGroupedCourses(
    @GetUser() user: JwtPayload,
  ): Promise<GroupedEnrollmentsResponseDto> {
    return await this.enrollmentQueryService.getMyEnrollmentsGroupedByPeriod(
      user,
    );
  }

  /**
   * @method getMyGradesForCourse
   * @description
   * Fetches grades and the grading scheme for a specific academic course for the authenticated user.
   * @param {string} academicCourseId - The UUID of the academic course to retrieve grades for.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<GradesAndSchemeDTO | null>} A promise that resolves to a DTO containing grades and scheme, or null if not found.
   */
  @Get("my-grades/:academicCourseId")
  async getMyGradesForCourse(
    @Param("academicCourseId", ParseUUIDPipe) academicCourseId: string,
    @GetUser() user: JwtPayload,
  ): Promise<GradesAndSchemeDTO | null> {
    return await this.enrollmentQueryService.getMyGradesForCourse(
      academicCourseId,
      user,
    );
  }

  /**
   * @method getAllGrades
   * @description
   * Retrieves all grades for the authenticated user across all enrolled courses.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<GradesAndPercentResponseDto[]>} A promise that resolves to an array of DTOs containing grade information.
   */
  @Get("my-grades")
  @UseGuards(AuthGuard("jwt"))
  async getAllGrades(
    @GetUser() user: JwtPayload,
  ): Promise<GradesAndPercentResponseDto[]> {
    return await this.enrollmentQueryService.getAllGrades(user);
  }

  /**
   * @method getMyScheduleForCourse
   * @description
   * Fetches the schedule for a specific academic course for the authenticated user.
   * @param {string} academicCourseId - The UUID of the academic course to retrieve the schedule for.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<any>} A promise that resolves to the schedule data (type inferred from service).
   */
  @Get("my-schedule/:academicCourseId")
  async getMyScheduleForCourse(
    @Param("academicCourseId", ParseUUIDPipe) academicCourseId: string,
    @GetUser() user: JwtPayload,
  ) {
    return await this.enrollmentQueryService.getMyScheduleForCourse(
      academicCourseId,
      user,
    );
  }

  /**
   * @method getMySchedule
   * @description
   * Retrieves the complete academic schedule for the authenticated user across all enrolled courses.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<any>} A promise that resolves to the complete schedule data (type inferred from service).
   */
  @Get("my-schedule")
  async getMySchedule(@GetUser() user: JwtPayload) {
    return await this.enrollmentQueryService.getMySchedule(user);
  }

  /**
   * @method getAvailableLabGroups
   * @description
   * Fetches a list of available lab groups for the authenticated user to enroll in.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<AcademicCourseDTO[]>} A promise that resolves to an array of available academic course DTOs (representing lab groups).
   */
  @Get("available-labs")
  async getAvailableLabGroups(
    @GetUser() user: JwtPayload,
  ): Promise<AcademicCourseDTO[]> {
    return await this.enrollmentLabGroupService.getAvaLabGroupsForUser(user);
  }

  /**
   * @method enrollInLabGroups
   * @description
   * Allows the authenticated user to enroll in specified lab groups.
   * This endpoint is protected by `LabEnrollmentActiveGuard` to ensure enrollment is only possible during active periods.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @param {EnrollLabGroupDto} enrollLabGroupDto - DTO containing information about the lab groups to enroll in.
   * @returns {Promise<{ message: string }>} A promise that resolves to a success message.
   */
  @Post("enroll-labs")
  @UseGuards(AuthGuard("jwt"))
  @UseGuards(LabEnrollmentActiveGuard)
  async enrollInLabGroups(
    @GetUser() user: JwtPayload,
    @Body() enrollLabGroupDto: EnrollLabGroupDto,
  ): Promise<{ message: string }> {
    console.log(user);
    console.log(enrollLabGroupDto);

    await this.enrollmentLabGroupService.enrollInLabGroups(
      enrollLabGroupDto,
      user,
    );
    return { message: "Matrícula en laboratorios exitosa." };
  }

  /**
   * @method getLabEnrollmentStatus
   * @description
   * Checks if the lab enrollment period is currently active.
   * @returns {Promise<{ isActive: boolean }>} A promise that resolves to an object indicating whether lab enrollment is active.
   */
  @Get("periods/status/laboratory")
  async getLabEnrollmentStatus(): Promise<{ isActive: boolean }> {
    const isActive = await this.eventService.isEventActive(
      EventType.LAB_ENROLLMENT,
    );
    return { isActive };
  }

  /**
   * @method getAcademicPeriodStatus
   * @description
   * Checks if the general academic period is currently active.
   * @returns {Promise<{ isActive: boolean }>} A promise that resolves to an object indicating whether the academic period is active.
   */
  @Get("periods/status/academic")
  async getAcademicPeriodStatus(): Promise<{ isActive: boolean }> {
    const isActive = await this.eventService.isEventActive(EventType.ACADEMIC);
    return { isActive };
  }

  /**
   * @method getGradingPeriodStatus
   * @description
   * Checks if the grading period is currently active.
   * @returns {Promise<{ isActive: boolean }>} A promise that resolves to an object indicating whether the grading period is active.
   */
  @Get("periods/status/grading")
  async getGradingPeriodStatus(): Promise<{ isActive: boolean }> {
    const isActive = await this.eventService.isEventActive(EventType.GRADING);
    return { isActive };
  }

  @Get("student/:studentId/grades")
  @Roles(Role.ADMIN, Role.SECRETARY) // Solo personal autorizado
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  async getStudentGrades(@Param("studentId", ParseUUIDPipe) studentId: string) {
    return await this.enrollmentQueryService.getGradesByStudentId(studentId);
  }
}
