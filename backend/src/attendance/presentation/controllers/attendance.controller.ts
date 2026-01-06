import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AttendanceQueryService } from '../../application/services/attendance-query.service';
import { TakeAttendanceService } from '../../application/services/take-attendance.service';
import { StudentCourseAttendanceResponseDto } from '../../application/dto/student-course-attendance-response.dto';
import { GroupAttendanceRecordResponseDto } from '../../application/dto/group-attendance-record-response.dto';
import { UpdateAttendanceRequestDto } from '../../application/dto/update-attendance-request.dto';
import { TakeAttendanceResponseDto } from '../../application/dto/take-attendance-response.dto';
import { GetUser } from 'src/users/presentation/decorators/get_user.decorator';
import type { JwtPayload } from 'src/auth/domain/interfaces/jwt-payload.interface';

/**
 * @class AttendanceController
 * @description
 * Controller responsible for handling attendance-related HTTP requests.
 * It provides endpoints for students to view their attendance, and for teachers
 * to view group attendance history, check if attendance can be taken, and record/update attendance.
 * All endpoints are protected by JWT authentication.
 */
@Controller('attendance')
@UseGuards(AuthGuard('jwt'))
export class AttendanceController {
  /**
   * @constructor
   * @param {AttendanceQueryService} attendanceQueryService - Service for querying attendance-related data.
   * @param {TakeAttendanceService} takeAttendanceService - Service for managing the process of taking and updating attendance.
   */
  constructor(
    private readonly attendanceQueryService: AttendanceQueryService,
    private readonly takeAttendanceService: TakeAttendanceService,
  ) {}

  /**
   * @method getMyAttendanceForCourse
   * @description
   * Retrieves the authenticated student's attendance records for a specific academic course.
   * Only accessible by students.
   * @param {string} academicCourseId - The UUID of the academic course.
   * @param {JwtPayload} user - The authenticated user's JWT payload (student).
   * @returns {Promise<StudentCourseAttendanceResponseDto>} A promise that resolves to a DTO containing the student's attendance.
   */
  @Get('my-attendance/:academicCourseId')
  @UseGuards(AuthGuard('jwt'))
  async getMyAttendanceForCourse(
    @Param('academicCourseId', ParseUUIDPipe) academicCourseId: string,
    @GetUser() user: JwtPayload,
  ): Promise<StudentCourseAttendanceResponseDto> {
    return await this.attendanceQueryService.getMyAttendanceForCourse(
      academicCourseId,
      user,
    );
  }

  /**
   * @method getGroupAttendanceHistory
   * @description
   * Retrieves the attendance history for a specific academic group.
   * Only accessible by teachers assigned to the group.
   * @param {string} groupId - The UUID of the academic group.
   * @param {JwtPayload} user - The authenticated user's JWT payload (teacher).
   * @returns {Promise<GroupAttendanceRecordResponseDto[]>} A promise that resolves to an array of DTOs containing the group's attendance history.
   */
  @Get('group/:groupId/history')
  @UseGuards(AuthGuard('jwt'))
  async getGroupAttendanceHistory(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @GetUser() user: JwtPayload,
  ): Promise<GroupAttendanceRecordResponseDto[]> {
    return await this.attendanceQueryService.getGroupAttendanceHistory(
      groupId,
      user,
    );
  }

  /**
   * @method takeAttendance
   * @description
   * Records or updates attendance for a specific academic group.
   * This endpoint first checks if attendance can be taken using `checkCanTakeAttendance`.
   * Only accessible by teachers assigned to the group and during scheduled class times.
   * @param {string} groupId - The UUID of the academic group.
   * @param {UpdateAttendanceRequestDto} updateDto - DTO containing the student attendance statuses.
   * @param {JwtPayload} user - The authenticated user's JWT payload (teacher).
   * @returns {Promise<void>} A promise that resolves when attendance has been recorded or updated.
   */
  @Post('group/:groupId/take')
  @UseGuards(AuthGuard('jwt'))
  async takeAttendance(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() updateDto: UpdateAttendanceRequestDto,
    @GetUser() user: JwtPayload,
  ) {
    await this.takeAttendanceService.takeAttendance(groupId, updateDto, user);
    return { success: true, message: "Asistencia registrada correctamente" };
  }

  /**
   * @method checkCanTakeAttendance
   * @description
   * Checks if attendance can currently be taken for a specific academic group.
   * Verifies user role, group assignment, and current time against schedule.
   * Only accessible by teachers assigned to the group.
   * @param {string} groupId - The UUID of the academic group.
   * @param {JwtPayload} user - The authenticated user's JWT payload (teacher).
   * @returns {Promise<TakeAttendanceResponseDto>} A promise that resolves to a DTO indicating if attendance can be taken and the reason if not.
   */
  @Get('group/:groupId/check')
  @UseGuards(AuthGuard('jwt'))
  async checkCanTakeAttendance(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @GetUser() user: JwtPayload,
  ): Promise<TakeAttendanceResponseDto> {
    return await this.takeAttendanceService.checkCanTakeAttendance(groupId, user);
  }
}
