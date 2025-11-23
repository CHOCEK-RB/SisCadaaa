import { StudentAttendanceInfoDTO } from './student-attendance-info.dto';

export class GroupAttendanceRecordResponseDto {
  attendanceId: string;
  classDate: string;
  students: StudentAttendanceInfoDTO[];
}
