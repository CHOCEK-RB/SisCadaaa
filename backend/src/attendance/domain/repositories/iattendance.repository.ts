import { AcademicGroup } from 'src/groups/domain/aggregates/academic_group.entity';
import { Attendance, LocationStatus } from '../aggregates/attendance.entity';
import { Teacher } from 'src/users/domain/aggregates/teacher.entity';

export const IAttendanceRepository = Symbol('IAttendanceRepository');

export interface IAttendanceRepository {
  findById(id: string): Promise<Attendance | null>;
  findByGroupAndDate(id: string, date: Date): Promise<Attendance | null>;
  findByGroupIds(groupIds: string[]): Promise<Attendance[]>;
  save(attendance: Attendance): Promise<Attendance>;
  save(attendances: Attendance[]): Promise<Attendance[]>;
  add(attendance: Attendance): Promise<Attendance>;
}
