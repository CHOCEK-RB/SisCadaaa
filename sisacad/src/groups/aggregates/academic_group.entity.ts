import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';

import { ScheduleSlot } from './schedule.entity';
import { AcademicCourse } from 'src/courses/aggregates/academic_course.entity';
import { Teacher } from 'src/users/aggregates/teacher.entity';
import { Attendance } from 'src/attendance/aggregates/attendance.entity';

export enum GroupType {
  LABORATORY = 'laboratory',
  THEORY = 'theory',
  PRACTICE = 'practice',
}

@Entity()
export class AcademicGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('int')
  capacity: number;

  @Column('enum', { enum: GroupType, default: GroupType.THEORY })
  type: GroupType;

  @ManyToOne(() => AcademicCourse, (course) => course.groups)
  academicCourse: AcademicCourse;

  @ManyToOne(() => Teacher, (teacher) => teacher.groups)
  teacher: Teacher;

  @OneToMany(() => ScheduleSlot, (slot) => slot.academicGroup, {
    cascade: true,
    eager: true,
  })
  schedule: ScheduleSlot[];

  @OneToMany(() => Attendance, (record) => record.academicGroup)
  attendances: Promise<Attendance[]>;
}
