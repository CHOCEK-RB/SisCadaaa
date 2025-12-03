import { AcademicCourse } from '../aggregates/academic_course.entity';

export const IAcademicCourseRepository = Symbol('IAcademicCourseRepository');

export interface IAcademicCourseRepository {
  findById(id: string): Promise<AcademicCourse | null>;
  findByIdWithCoordinator(id: string): Promise<AcademicCourse | null>;
  findCreatedAfterDate(date: Date): Promise<AcademicCourse[] | null>;
  findByIdAndStudentId(
    id: string,
    studentId: string,
  ): Promise<AcademicCourse | null>;
  findAll(): Promise<AcademicCourse[]>;
  findAllWithTopics(): Promise<AcademicCourse[]>;
  save(courses: AcademicCourse[]): Promise<AcademicCourse[]>;
  save(course: AcademicCourse): Promise<AcademicCourse>;
  add(academicCourse: AcademicCourse): Promise<AcademicCourse>;
}
