import { AttendanceStatus } from '../../domain/aggregates/attendance.entity';

export class StudentAttendanceInfoDTO {
  studentId: string;
  cui: string;
  firstName: string;
  lastName: string;
  status: AttendanceStatus;
}
