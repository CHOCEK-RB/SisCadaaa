import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AttendanceService } from '../applicaction/attendance.service';
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
    return this.attendanceService.getMyAttendanceForCourse(
      academicCourseId,
      user,
    );
  }
}
