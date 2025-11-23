import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { EnrollmentQueryService } from '../../../enrollment/application/services/enrollment-query.service';
import { EnrollmentLabGroupService } from '../../../enrollment/application/services/enrollment-lab-group.service';
import { GroupedEnrollmentsResponseDto } from '../../../enrollment/application/dto/grouped-enrollments-response.dto';
import { GradesAndPercentResponseDto } from '../../../enrollment/application/dto/grades-and-percent-response.dto';
import { GradesAndSchemeDTO } from '../../../enrollment/application/dto/grades-and-scheme.dto';

import { GetUser } from '../../../users/presentation/decorators/get_user.decorator';

import type { JwtPayload } from '../../../auth/domain/interfaces/jwt-payload.interface';

import { AcademicCourseDTO } from '../../../courses/application/dto/academic_course.dto';

import { EnrollLabGroupDto } from '../../../enrollment/application/dto/enrollment.dto';

/**
 * @class StudentEnrollmentController
 * @description
 * Controller responsible for handling student-specific enrollment and academic course information.
 * It provides endpoints for fetching courses, grades, schedules, and enrolling in lab groups.
 * All endpoints are protected by JWT authentication.
 */
@Controller('student/enrollments')
@UseGuards(AuthGuard('jwt'))
export class StudentEnrollmentController {
  /**
   * @constructor
   * @param {EnrollmentQueryService} enrollmentQueryService - Service for querying enrollment-related data.
   * @param {EnrollmentLabGroupService} enrollmentLabGroupService - Service for handling operations related to enrolling in lab groups.
   */
  constructor(
    private readonly enrollmentQueryService: EnrollmentQueryService,
    private readonly enrollmentLabGroupService: EnrollmentLabGroupService,
  ) {}

  /**
   * @method getMyGroupedCourses
   * @description
   * Retrieves the authenticated student's enrolled courses, grouped by academic period.
   * @param {JwtPayload} user - The authenticated user's JWT payload containing student information.
   * @returns {Promise<GroupedEnrollmentsResponseDto>} A promise that resolves to a DTO containing grouped enrollment information.
   * @returns {Promise<GroupedEnrollmentsResponseDto>} A DTO containing the student's grouped enrollments.
   */
  @Get('courses')
  @UseGuards(AuthGuard('jwt'))
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
   * Fetches grades and the grading scheme for a specific academic course for the authenticated student.
   * @param {string} academicCourseId - The UUID of the academic course to retrieve grades for.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<GradesAndSchemeDTO | null>} A promise that resolves to a DTO containing grades and scheme, or null if not found.
   */
  @Get('grades/:academicCourseId')
  async getMyGradesForCourse(
    @Param('academicCourseId', ParseUUIDPipe) academicCourseId: string,
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
   * Retrieves all grades for the authenticated student across all enrolled courses.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<GradesAndPercentResponseDto[]>} A promise that resolves to an array of DTOs containing grade information.
   */
  @Get('grades')
  @UseGuards(AuthGuard('jwt'))
  async getAllGrades(
    @GetUser() user: JwtPayload,
  ): Promise<GradesAndPercentResponseDto[]> {
    return await this.enrollmentQueryService.getAllGrades(user);
  }

  /**
   * @method getMyScheduleForCourse
   * @description
   * Fetches the schedule for a specific academic course for the authenticated student.
   * @param {string} academicCourseId - The UUID of the academic course to retrieve the schedule for.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<any>} A promise that resolves to the schedule data (type inferred from service).
   */
  @Get('schedule/:academicCourseId')
  async getMyScheduleForCourse(
    @Param('academicCourseId', ParseUUIDPipe) academicCourseId: string,
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
   * Retrieves the complete academic schedule for the authenticated student across all enrolled courses.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<any>} A promise that resolves to the complete schedule data (type inferred from service).
   */
  @Get('schedule')
  async getMySchedule(@GetUser() user: JwtPayload) {
    return await this.enrollmentQueryService.getMySchedule(user);
  }

  /**
   * @method getAvailableLabGroups
   * @description
   * Fetches a list of available lab groups for the authenticated student to enroll in.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<AcademicCourseDTO[]>} A promise that resolves to an array of available academic course DTOs (representing lab groups).
   */
  @Get('available-labs')
  async getAvailableLabGroups(
    @GetUser() user: JwtPayload,
  ): Promise<AcademicCourseDTO[]> {
    return await this.enrollmentLabGroupService.getAvaLabGroupsForUser(user);
  }

  /**
   * @method enrollInLabGroups
   * @description
   * Allows the authenticated student to enroll in specified lab groups.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @param {EnrollLabGroupDto} enrollLabGroupDto - DTO containing information about the lab groups to enroll in.
   * @returns {Promise<{ message: string }>} A promise that resolves to a success message.
   */
  @Post('enroll-labs')
  @UseGuards(AuthGuard('jwt'))
  async enrollInLabGroups(
    @GetUser() user: JwtPayload,
    @Body() enrollLabGroupDto: EnrollLabGroupDto,
  ): Promise<{ message: string }> {
    await this.enrollmentLabGroupService.enrollInLabGroups(
      enrollLabGroupDto,
      user,
    );
    return { message: 'Matrícula en laboratorios exitosa.' };
  }
}
