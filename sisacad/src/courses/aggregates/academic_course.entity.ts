import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinTable,
  OneToMany,
} from 'typeorm';

import { Course } from './course.entity';
import { CourseTopic } from './course_topic.entity';

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
  id: number;

  @Column('jsonb')
  grades: GradingScheme;

  @OneToOne(() => Course)
  @JoinTable()
  course: Course;

  @OneToMany(() => CourseTopic, (topics) => topics.course)
  topics: CourseTopic[];
}
