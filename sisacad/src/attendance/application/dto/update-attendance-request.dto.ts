import { AttendanceStatus } from '../../domain/aggregates/attendance.entity';

export class UpdateAttendanceRequestDto {
  studentStatuses: Record<string, AttendanceStatus>;
}
