import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import {
  EnrollmentService,
  GroupedEnrollments,
  GradesAndPercent,
} from '../application/enrollment.service';
import { EnrollmentPeriodService } from '../application/enrollment_period.service';

import { GetUser } from 'src/users/presentation/decorators/get_user.decorator';

import type { JwtPayload } from 'src/auth/interface/jwt-payload.interface';

import { Grades } from '../aggregates/enrollment.entity';
import { AcademicCourseDTO } from 'src/courses/application/dto/academic_course.dto';

import { LabEnrollmentActiveGuard } from '../guards/lab-enrollment-active/lab-enrollment-active.guard';
import { EnrollLabGroupDto } from '../application/dto/enrollment.dto';
import { Enrollment } from '../aggregates/enrollment.entity';
import { PeriodType } from '../aggregates/enrollment_period.entity';

@Controller('enrollments')
@UseGuards(AuthGuard('jwt'))
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    private readonly enrollmentPeriodService: EnrollmentPeriodService,
  ) {}

  @Get('my-courses')
  @UseGuards(AuthGuard('jwt'))
  async getMyGroupedCourses(
    @GetUser() user: JwtPayload,
  ): Promise<GroupedEnrollments> {
    return await this.enrollmentService.getMyEnrollmentsGroupedByPeriod(user);
  }

  @Get('my-grades/:academicCourseId')
  async getMyGradesForCourse(
    @Param('academicCourseId', ParseUUIDPipe) academicCourseId: string,
    @GetUser() user: JwtPayload,
  ): Promise<Grades | null> {
    return await this.enrollmentService.getMyGradesForCourse(
      academicCourseId,
      user,
    );
  }

  @Get('my-grades')
  @UseGuards(AuthGuard('jwt'))
  async getAllGrades(@GetUser() user: JwtPayload): Promise<GradesAndPercent[]> {
    return await this.enrollmentService.getAllGrades(user);
  }

  @Get('my-schedule/:academicCourseId')
  async getMyScheduleForCourse(
    @Param('academicCourseId', ParseUUIDPipe) academicCourseId: string,
    @GetUser() user: JwtPayload,
  ) {
    return await this.enrollmentService.getMyScheduleForCourse(
      academicCourseId,
      user,
    );
  }

  @Get('my-schedule')
  async getMySchedule(@GetUser() user: JwtPayload) {
    return await this.enrollmentService.getMySchedule(user);
  }

  @Get('available-labs')
  async getAvailableLabGroups(
    @GetUser() user: JwtPayload,
  ): Promise<AcademicCourseDTO[]> {
    return await this.enrollmentService.getAvaLabGroupsForUser(user);
  }

  @Post('enroll-labs')
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(LabEnrollmentActiveGuard)
  @HttpCode(HttpStatus.OK)
  async enrollInLabGroups(
    @GetUser() user: JwtPayload,
    @Body() enrollLabGroupDto: EnrollLabGroupDto,
  ): Promise<Enrollment[]> {
    console.log(user);
    console.log(enrollLabGroupDto);

    return await this.enrollmentService.enrollInLabGroups(
      enrollLabGroupDto,
      user,
    );
  }

  @Get('periods/status/laboratory')
  async getLabEnrollmentStatus(): Promise<{ isActive: boolean }> {
    const isActive = await this.enrollmentPeriodService.isPeriodActive(
      PeriodType.LABORATORY,
    );
    return { isActive };
  }
}
