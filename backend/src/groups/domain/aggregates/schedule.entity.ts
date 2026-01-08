import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { AcademicGroup } from "./academic_group.entity";
import { Classroom } from "src/classroom/domain/aggregates/classroom.entity";

export enum DayOfWeek {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
}

@Entity("schedule_slots")
export class ScheduleSlot {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("enum", { enum: DayOfWeek })
  day: DayOfWeek;

  @Column("timetz")
  startTime: string;

  @Column("timetz")
  endTime: string;

  @ManyToOne(() => Classroom, (classroom) => classroom.schedules)
  classroom: Classroom;

  @ManyToOne(() => AcademicGroup, (group) => group.schedule)
  @JoinColumn({ name: "academicGroupId" })
  academicGroup: AcademicGroup;
}
