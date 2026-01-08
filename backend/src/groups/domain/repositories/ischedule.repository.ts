import { AcademicGroup } from '../aggregates/academic_group.entity';
import { Classroom } from 'src/classroom/domain/aggregates/classroom.entity';
import { ScheduleSlot, DayOfWeek } from '../aggregates/schedule.entity';

export const IScheduleSlotRepository = Symbol('IScheduleSlotRepository');

export interface IScheduleSlotRepository {
  findById(id: string): Promise<ScheduleSlot | null>;
  findByIdWithAcademicGroup(id: string): Promise<ScheduleSlot | null>;
  findByAcademicGroup(groupId: string): Promise<ScheduleSlot[] | null>;
  findByClassroom(classromId: string): Promise<ScheduleSlot[] | null>;
  findConflictingSchedule(
    academicGroupId: string,
    classroomId: string,
    day: DayOfWeek,
    startTime: string,
    endTime: string,
  ): Promise<ScheduleSlot | null>;
  findAcademicGroupConflict( // NEW METHOD ADDED
    academicGroupId: string,
    day: DayOfWeek,
    startTime: string,
    endTime: string,
  ): Promise<ScheduleSlot | null>;
  findOverlappingScheduleSlots(
    classroomId: string,
    dayOfWeek: DayOfWeek,
    startTime: string,
    endTime: string,
  ): Promise<ScheduleSlot[]>;
  save(schedule: ScheduleSlot): Promise<ScheduleSlot>;
  save(schedules: ScheduleSlot[]): Promise<ScheduleSlot[]>;
  create(
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    classroom: Classroom,
    group: AcademicGroup,
  ): Promise<ScheduleSlot>;

  delete(id: string): Promise<void>;
}