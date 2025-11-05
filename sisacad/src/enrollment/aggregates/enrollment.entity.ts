import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Student } from 'src/users/aggregates/student.entity';
import { AcademicGroup } from 'src/groups/aggregates/academic_group.entity';
import { AcademicCourse } from 'src/courses/aggregates/academic_course.entity';

export class Grades {
  firstContinue: number = -1;
  secondContinue: number = -1;
  thirdContinue: number = -1;
  firstPartial: number = -1;
  secondPartial: number = -1;
  thirdPartial: number = -1;
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.enrollments)
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
