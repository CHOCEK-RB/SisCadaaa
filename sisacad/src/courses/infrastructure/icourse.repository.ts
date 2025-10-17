import { Course } from '../aggregates/course.entity';

export const ICourseRepository = Symbol('ICourseRepository');

export interface ICourseRepository {
  findById(id: string): Promise<Course | null>;
  findByCode(code: string): Promise<Course | null>;
  findByName(name: string): Promise<Course | null>;
  findAll(): Promise<Course[]>;
  save(course: Course): Promise<Course>;
  save(courses: Course[]): Promise<Course[]>;
  create(
    code: string,
    name: string,
    credits: number,
    semester: number,
  ): Promise<Course>;
}
