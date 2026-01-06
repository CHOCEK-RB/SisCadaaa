import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { AcademicCourse } from './academic_course.entity';
import { CourseTopic } from './course_topic.entity';

@Entity('topic_progress')
@Index(['academicCourse', 'groupName'], { unique: true })
export class TopicProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  groupName: string;

  @ManyToOne(() => AcademicCourse)
  academicCourse: AcademicCourse;

  @ManyToMany(() => CourseTopic, { cascade: true, eager: true })
  @JoinTable({
    name: 'topic_progress_completed_topics',
    joinColumn: {
      name: 'topicProgressId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'courseTopicId',
      referencedColumnName: 'id',
    },
  })
  completedTopics: CourseTopic[];
}
