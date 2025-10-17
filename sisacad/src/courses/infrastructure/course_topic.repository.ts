import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AcademicCourse } from '../aggregates/academic_course.entity';
import { CourseTopic } from '../aggregates/course_topic.entity';
import { ICourseTopicRepository } from './icourse_topic.repository';

@Injectable()
export class CourseTopicRepository implements ICourseTopicRepository {
  constructor(
    @InjectRepository(CourseTopic)
    private readonly typeormRepo: Repository<CourseTopic>,
  ) {}

  async findById(id: string): Promise<CourseTopic | null> {
    return this.typeormRepo.findOne({ where: { id } });
  }

  async findByAcademicCourseId(id: string): Promise<CourseTopic[] | null> {
    return this.typeormRepo.find({ where: { course: { id } } });
  }

  save(course: CourseTopic): Promise<CourseTopic>;
  save(courses: CourseTopic[]): Promise<CourseTopic[]>;
  async save(
    topicOrTopics: CourseTopic | CourseTopic[],
  ): Promise<CourseTopic | CourseTopic[]> {
    if (Array.isArray(topicOrTopics)) {
      return this.typeormRepo.save(topicOrTopics);
    } else {
      return this.typeormRepo.save(topicOrTopics);
    }
  }

  async create(
    order: number,
    topic: string,
    academicCourse: AcademicCourse,
  ): Promise<CourseTopic> {
    const newTopic = this.typeormRepo.create({
      topicOrder: order,
      topic: topic,
      course: academicCourse,
    });

    return this.typeormRepo.save(newTopic);
  }
}
