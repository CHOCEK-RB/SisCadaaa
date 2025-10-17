import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { AcademicCourse } from './academic_course.entity';

@Entity()
export class CourseTopic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  topicOrder: number;

  @Column('text')
  topic: string;

  @ManyToOne(() => AcademicCourse, (course) => course.topics)
  course: AcademicCourse;
}
