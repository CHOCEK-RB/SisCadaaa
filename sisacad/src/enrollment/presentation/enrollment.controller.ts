import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  EnrollmentService,
  GroupedEnrollments,
} from '../application/enrollment.service';
import { GetUser } from 'src/users/presentation/decorators/get_user.decorator';
import type { JwtPayload } from 'src/auth/interface/jwt-payload.interface';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get('my-courses')
  @UseGuards(AuthGuard('jwt'))
  async getMyGroupedCourses(
    @GetUser() user: JwtPayload,
  ): Promise<GroupedEnrollments> {
    return await this.enrollmentService.getMyEnrollmentsGroupedByPeriod(user);
  }
}
