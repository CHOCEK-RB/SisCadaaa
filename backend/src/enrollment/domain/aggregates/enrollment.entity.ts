import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Student } from 'src/users/domain/aggregates/student.entity';
import { AcademicGroup } from 'src/groups/domain/aggregates/academic_group.entity';
import { AcademicCourse } from 'src/courses/domain/aggregates/academic_course.entity';

export class Grades {
  firstContinue: number | null = null;
  secondContinue: number | null = null;
  thirdContinue: number | null = null;
  firstPartial: number | null = null;
  secondPartial: number | null = null;
  thirdPartial: number | null = null;
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.enrollments, { onDelete: 'CASCADE' })
  student: Student;

  @ManyToOne(() => AcademicCourse, (course) => course.enrollments)
  course: AcademicCourse;

  @ManyToMany(() => AcademicGroup, (group) => group.enrollments)
  @JoinTable()
  groups: AcademicGroup[];

  @Column('timestamptz')
  date: string;

  @Column('jsonb', { nullable: true })
  grades: Grades;

  @Column('enum', { enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  status: EnrollmentStatus;
}
