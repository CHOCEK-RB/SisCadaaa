import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';

import { Student } from 'src/users/aggregates/student.entity';
import { AcademicGroup } from 'src/groups/aggregates/academic_group.entity';
import { AcademicCourse } from 'src/courses/aggregates/academic_course.entity';

export class Grades {
  firstContinue: number;
  secondConitnue: number;
  thirdContinue: number;
  firstPartial: number;
  secondPartial: number;
  thirdPartial: number;
}

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.enrollments)
  student: Student;

  @ManyToOne(() => AcademicCourse, (course) => course.enrollments)
  course: AcademicCourse;

  @ManyToMany(() => AcademicGroup)
  @JoinTable()
  groups: AcademicGroup[];

  @Column('timestamptz')
  date: string;

  @Column('jsonb', { nullable: true })
  grades: Grades;
}
