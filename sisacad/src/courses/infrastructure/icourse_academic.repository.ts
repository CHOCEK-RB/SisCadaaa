import { AcademicCourse } from '../aggregates/academic_course.entity';
import { Course } from '../aggregates/course.entity';

export const IAcademicCourseRepository = Symbol('IAcademicCourseRepository');

export interface IAcademicCourseRepository {
  findById(id: string): Promise<AcademicCourse | null>;
  findByYear(date: Date): Promise<AcademicCourse | null>;
  findAll(): Promise<AcademicCourse[]>;
  save(courses: AcademicCourse[]): Promise<AcademicCourse[]>;
  save(course: AcademicCourse): Promise<AcademicCourse>;
  create(course: Course): Promise<AcademicCourse>;
}
