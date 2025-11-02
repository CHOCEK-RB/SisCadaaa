import {
  Controller,
  Get,
  UseGuards,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import {
  EnrollmentService,
  GroupedEnrollments,
  GradesAndPercent,
} from '../application/enrollment.service';

import { GetUser } from 'src/users/presentation/decorators/get_user.decorator';

import type { JwtPayload } from 'src/auth/interface/jwt-payload.interface';

import { Grades } from '../aggregates/enrollment.entity';

@Controller('enrollments')
@UseGuards(AuthGuard('jwt'))
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

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
}
