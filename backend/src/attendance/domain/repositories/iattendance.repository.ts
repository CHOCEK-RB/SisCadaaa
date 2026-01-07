import { Attendance } from "../aggregates/attendance.entity";

export const IAttendanceRepository = Symbol("IAttendanceRepository");

export interface IAttendanceRepository {
  findById(id: string): Promise<Attendance | null>;
  findByGroupAndDate(id: string, date: Date): Promise<Attendance | null>;
  findByGroupIds(groupIds: string[]): Promise<Attendance[]>;
  findByGroupId(groupId: string): Promise<Attendance[]>;
  save(attendance: Attendance): Promise<Attendance>;
  save(attendances: Attendance[]): Promise<Attendance[]>;
  add(attendance: Attendance): Promise<Attendance>;
}
