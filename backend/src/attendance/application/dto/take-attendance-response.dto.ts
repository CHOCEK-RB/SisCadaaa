import { StudentAttendanceInfoDTO } from './student-attendance-info.dto';

export class TakeAttendanceResponseDto {
  canTakeAttendance: boolean;
  reason?: string;
  currentSchedule?: {
    day: string;
    start: string;
    end: string;
    classroom: string;
  };
  todayAttendance?: {
    attendanceId: string;
    students: StudentAttendanceInfoDTO[];
  };
}
