import { AttendanceStatus } from '../../domain/aggregates/attendance.entity';
import { GroupType } from 'src/groups/domain/aggregates/academic_group.entity';

export class StudentAttendanceRecordDTO {
  classDate: string;
  status: AttendanceStatus;
}

export class GroupAttendanceDTO {
  groupId: string;
  groupName: string;
  groupType: GroupType;
  records: StudentAttendanceRecordDTO[];
  presentCount: number;
  absentCount: number;
  totalClasses: number;
  attendancePercentage: number;
}

export type StudentCourseAttendanceDTO = GroupAttendanceDTO[];
