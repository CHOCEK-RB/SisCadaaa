import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from '../aggregates/course.entity';
import { AcademicCourse } from '../aggregates/academic_course.entity';
import { IAcademicCourseRepository } from './icourse_academic.repository';

@Injectable()
export class AcademicCourseRepository implements IAcademicCourseRepository {
  constructor(
    @InjectRepository(AcademicCourse)
    private readonly typeormRepo: Repository<AcademicCourse>,
  ) {}

  async findById(id: string): Promise<AcademicCourse | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: ['topics', 'cordinator'],
      order: {
        topics: {
          topicOrder: 'ASC',
        },
      },
    });
  }

  async findByYear(date: Date): Promise<AcademicCourse | null> {
    return this.typeormRepo.findOne({ where: { creationDate: date } });
  }

  async findAll(): Promise<AcademicCourse[]> {
    return this.typeormRepo.find({ relations: { course: true } });
  }
  save(courses: AcademicCourse[]): Promise<AcademicCourse[]>;
  save(course: AcademicCourse): Promise<AcademicCourse>;
  async save(
    courseOrCourses: AcademicCourse | AcademicCourse[],
  ): Promise<AcademicCourse | AcademicCourse[]> {
    if (Array.isArray(courseOrCourses)) {
      return this.typeormRepo.save(courseOrCourses);
    } else {
      return this.typeormRepo.save(courseOrCourses);
    }
  }

  async create(course: Course): Promise<AcademicCourse> {
    const newAcademicCourse = this.typeormRepo.create({
      creationDate: Date.now(),
      course: course,
    });
    return this.typeormRepo.save(newAcademicCourse);
  }
}
