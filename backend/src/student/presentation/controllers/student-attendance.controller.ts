import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AttendanceQueryService } from '../../../attendance/application/services/attendance-query.service';
import { StudentCourseAttendanceResponseDto } from '../../../attendance/application/dto/student-course-attendance-response.dto';
import { GetUser } from '../../../users/presentation/decorators/get_user.decorator';
import type { JwtPayload } from '../../../auth/domain/interfaces/jwt-payload.interface';

/**
 * @class StudentAttendanceController
 * @description
 * Controller responsible for handling student-specific attendance HTTP requests.
 * It provides an endpoint for students to retrieve their attendance records for a given academic course.
 * All endpoints are protected by JWT authentication and are only accessible by students.
 */
@Controller('student/attendance')
@UseGuards(AuthGuard('jwt'))
export class StudentAttendanceController {
  /**
   * @constructor
   * @param {AttendanceQueryService} attendanceQueryService - Service for querying attendance-related data.
   */
  constructor(
    private readonly attendanceQueryService: AttendanceQueryService,
  ) {}

  /**
   * @method getForCourse
   * @description
   * Retrieves the authenticated student's attendance records for a specific academic course.
   * @param {string} academicCourseId - The UUID of the academic course to retrieve attendance for.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<StudentCourseAttendanceResponseDto>} A promise that resolves to a DTO containing the student's attendance.
   */
  @Get('course/:academicCourseId')
  @UseGuards(AuthGuard('jwt'))
  async getForCourse(
    @Param('academicCourseId', ParseUUIDPipe) academicCourseId: string,
    @GetUser() user: JwtPayload,
  ): Promise<StudentCourseAttendanceResponseDto> {
    return await this.attendanceQueryService.getMyAttendanceForCourse(
      academicCourseId,
      user,
    );
  }
}

