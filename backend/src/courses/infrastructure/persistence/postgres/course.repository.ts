import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm"; // Import Like

import { Course } from "src/courses/domain/aggregates/course.entity";
import { ICourseRepository } from "src/courses/domain/repositories/icourse.repository";

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

  async add(course: Course): Promise<Course> {
    return this.typeormRepo.save(course);
  }

  async searchCourses(query: string): Promise<Course[]> {
    return this.typeormRepo.find({
      where: [
        { name: Like(`%${query}%`) },
        { code: Like(`%${query}%`) },
      ],
    });
  }
}
