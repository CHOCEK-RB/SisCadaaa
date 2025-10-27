import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Course } from './course.entity';
import { CourseTopic } from './course_topic.entity';

import { Teacher } from 'src/users/aggregates/teacher.entity';
import { AcademicGroup } from 'src/groups/aggregates/academic_group.entity';
import { Enrollment } from 'src/enrollment/aggregates/enrollment.entity';

export class GradingScheme {
  firstContinue: number;
  secondContinue: number;
  thirdContinue: number;
  firstPartial: number;
  secondPartial: number;
  thirdPartial: number;
}

@Entity()
export class AcademicCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.coordinatedCourses)
  coordinator: Teacher;

  @Column('timestamptz')
  creationDate: Date;

  @Column({ nullable: true })
  urlSyllabus?: string;

  @Column('jsonb', { nullable: true })
  grades?: GradingScheme;

  @ManyToOne(() => Course, (course) => course.academicCourses)
  course: Course;

  @OneToMany(() => AcademicGroup, (group) => group.academicCourse)
  groups: Promise<AcademicGroup[]>;

  @OneToMany(() => CourseTopic, (topics) => topics.course)
  topics: Promise<CourseTopic[]>;

  @OneToMany(() => Enrollment, (enrollments) => enrollments.course)
  enrollments: Promise<Enrollment[]>;
}
