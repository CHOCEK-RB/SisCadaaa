import { Course } from '../aggregates/course.entity';

export const ICourseRepository = Symbol('ICourseRepository');

export interface ICourseRepository {
  findById(id: string): Promise<Course | null>;
  findByCode(code: string): Promise<Course | null>;
  findByName(name: string): Promise<Course | null>;
  searchCourses(query: string): Promise<Course[]>;
  findAll(): Promise<Course[]>;
  save(course: Course): Promise<Course>;
  save(courses: Course[]): Promise<Course[]>;
  add(course: Course): Promise<Course>;
}
