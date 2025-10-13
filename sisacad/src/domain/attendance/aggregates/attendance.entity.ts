import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { AcademicGroup } from 'src/domain/groups/aggregates/academic_group.entity';

export enum LocationStatus {
  UNIVERSITY = 'university',
  OTHER = 'other',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  JUSTIFIED = 'justified',
}

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('uuid')
  idTeacher: number;

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
