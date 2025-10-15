import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { AcademicCourse } from './academic_course.entity';

@Entity()
export class CourseTopic {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('text')
  topic: string;

  @ManyToOne(() => AcademicCourse, (course) => course.topics)
  course: AcademicCourse;
}
