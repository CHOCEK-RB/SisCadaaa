import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from '../aggregates/course.entity';
import { ICourseRepository } from './icourse.repository';

@Injectable()
export class CourseRepository implements ICourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly typeormRepo: Repository<Course>,
  ) {}

  async findById(id: string): Promise<Course | null> {
    return this.typeormRepo.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<Course | null> {
    return this.typeormRepo.findOne({ where: { code } });
  }

  async findByName(name: string): Promise<Course | null> {
    return this.typeormRepo.findOne({ where: { name } });
  }

  async findAll(): Promise<Course[]> {
    return this.typeormRepo.find();
  }

  save(course: Course): Promise<Course>;
  save(courses: Course[]): Promise<Course[]>;
  async save(courseOrCourses: Course | Course[]): Promise<Course | Course[]> {
    if (Array.isArray(courseOrCourses)) {
      return this.typeormRepo.save(courseOrCourses);
    } else {
      return this.typeormRepo.save(courseOrCourses);
    }
  }

  async create(
    code: string,
    name: string,
    credits: number,
    semester: number,
  ): Promise<Course> {
    const newCourse = this.typeormRepo.create({
      code: code,
      name: name,
      credits: credits,
      semester: semester,
    });
    return this.typeormRepo.save(newCourse);
  }
}
