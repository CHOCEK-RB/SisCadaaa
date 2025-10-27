import { AcademicGroup } from '../aggregates/academic_group.entity';
import { Classroom } from 'src/classroom/aggregates/classrom.entity';
import { ScheduleSlot, DayOfWeek } from '../aggregates/schedule.entity';

export const IScheduleSlotRepository = Symbol('IScheduleSlotRepository');

export interface IScheduleSlotRepository {
  findById(id: string): Promise<ScheduleSlot | null>;
  findByAcademicGroup(groupId: string): Promise<ScheduleSlot[] | null>;
  findByClassroom(classromId: string): Promise<ScheduleSlot[] | null>;
  save(schedule: ScheduleSlot): Promise<ScheduleSlot>;
  save(schedules: ScheduleSlot[]): Promise<ScheduleSlot[]>;
  create(
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    classroom: Classroom,
    group: AcademicGroup,
  ): Promise<ScheduleSlot>;
}
