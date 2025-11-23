export enum GroupType {
  LABORATORY = "laboratory",
  THEORY = "theory",
  PRACTICE = "practice",
}

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
}

export interface StudentAttendanceRecordDTO {
  classDate: string;
  status: AttendanceStatus;
}

export interface GroupAttendanceDTO {
  groupId: string;
  groupName: string;
  groupType: GroupType;
  records: StudentAttendanceRecordDTO[];
  presentCount: number;
  absentCount: number;
  totalClasses: number;
  attendancePercentage: number;
}
