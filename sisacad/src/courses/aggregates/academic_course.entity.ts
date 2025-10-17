import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Course } from './course.entity';
import { CourseTopic } from './course_topic.entity';

import { Teacher } from 'src/users/aggregates/teacher.entity';

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

  @OneToOne(() => Teacher)
  coordinator: Promise<Teacher>;

  @Column('timestamptz')
  creationDate: Date;

  @Column({ nullable: true })
  urlSyllabus?: string;

  @Column('jsonb', { nullable: true })
  grades?: GradingScheme;

  @ManyToOne(() => Course, (course) => course.academicCourses)
  course: Course;

  @OneToMany(() => CourseTopic, (topics) => topics.course)
  topics: Promise<CourseTopic[]>;
}
