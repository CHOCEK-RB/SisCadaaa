import { AcademicGroup } from 'src/groups/aggregates/academic_group.entity';
import { Attendance, LocationStatus } from '../aggregates/attendance.entity';
import { Teacher } from 'src/users/aggregates/teacher.entity';

export const IAttendanceRepository = Symbol('IAttendanceRepository');

export interface IAttendanceRepository {
  findById(id: string): Promise<Attendance | null>;
  findByGroupAndDate(id: string, date: Date): Promise<Attendance | null>;
  findByGroupIds(groupIds: string[]): Promise<Attendance[]>;
  save(attendance: Attendance): Promise<Attendance>;
  save(attendances: Attendance[]): Promise<Attendance[]>;
  create(
    teacher: Teacher,
    ipAddress: string,
    location: LocationStatus,
    group: AcademicGroup,
  ): Promise<Attendance>;
}
