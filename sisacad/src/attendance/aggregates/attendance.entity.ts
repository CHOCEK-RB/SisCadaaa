import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { AcademicGroup } from 'src/groups/aggregates/academic_group.entity';
import { Teacher } from 'src/users/aggregates/teacher.entity';

export enum LocationStatus {
  UNIVERSITY = 'university',
  OTHER = 'other',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
}

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.attendances)
  teacher: Teacher;

  @Column('timestamptz')
  classDate: Date;

  @Column({
    type: 'jsonb',
    default: {},
  })
  studentStatuses: Record<string, AttendanceStatus>;

  @Column('inet')
  ipAddress: string;

  @Column('enum', { enum: LocationStatus, default: LocationStatus.UNIVERSITY })
  location: LocationStatus;

  @ManyToOne(() => AcademicGroup, (group) => group.attendances)
  academicGroup: AcademicGroup;
}
