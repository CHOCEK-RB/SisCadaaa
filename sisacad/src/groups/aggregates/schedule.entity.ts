import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { AcademicGroup } from './academic_group.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
}

@Entity('schedule_slots')
export class ScheduleSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('enum', { enum: DayOfWeek })
  day: DayOfWeek;

  @Column('time')
  startTime: string;

  @Column('time')
  endTime: string;

  @Column()
  classroomId: string;

  @ManyToOne(() => AcademicGroup, (group) => group.schedule)
  @JoinColumn({ name: 'academicGroupId' })
  academicGroup: AcademicGroup;
}
