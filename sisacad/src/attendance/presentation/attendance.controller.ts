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
import {
  AttendanceService,
  type GroupAttendanceRecord,
  type UpdateAttendanceDto,
  type TakeAttendanceResponse,
} from '../applicaction/attendance.service';
import type { StudentCourseAttendanceDTO } from '../applicaction/dto/attendance.dto';
import { GetUser } from 'src/users/presentation/decorators/get_user.decorator';
import type { JwtPayload } from 'src/auth/interface/jwt-payload.interface';

@Controller('attendance')
@UseGuards(AuthGuard('jwt'))
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('my-attendance/:academicCourseId')
  @UseGuards(AuthGuard('jwt'))
  async getMyAttendanceForCourse(
    @Param('academicCourseId', ParseUUIDPipe) academicCourseId: string,
    @GetUser() user: JwtPayload,
  ): Promise<StudentCourseAttendanceDTO> {
    return await this.attendanceService.getMyAttendanceForCourse(
      academicCourseId,
      user,
    );
  }

  @Get('group/:groupId/history')
  @UseGuards(AuthGuard('jwt'))
  async getGroupAttendanceHistory(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @GetUser() user: JwtPayload,
  ): Promise<GroupAttendanceRecord[]> {
    return await this.attendanceService.getGroupAttendanceHistory(
      groupId,
      user,
    );
  }

  @Post('group/:groupId/taketory')
  @UseGuards(AuthGuard('jwt'))
  async takeAttendance(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() updateDto: UpdateAttendanceDto,
    @GetUser() user: JwtPayload,
  ): Promise<void> {
    return await this.attendanceService.takeAttendance(
      groupId,
      updateDto,
      user,
    );
  }

  @Get('group/:groupId/check')
  @UseGuards(AuthGuard('jwt'))
  async checkCanTakeAttendance(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @GetUser() user: JwtPayload,
  ): Promise<TakeAttendanceResponse> {
    return await this.attendanceService.checkCanTakeAttendance(groupId, user);
  }
}
