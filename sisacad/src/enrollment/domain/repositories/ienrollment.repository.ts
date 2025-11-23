import { Enrollment } from '../aggregates/enrollment.entity';

export const IEnrollmentRepository = Symbol('IEnrollmentRepository');

export interface IEnrollmentRepository {
  findById(id: string): Promise<Enrollment | null>;
  findAll(): Promise<Enrollment[]>;
  findAllWithGradesByStudent(studentId: string): Promise<Enrollment[]>;
  findByStudentAndCourseActive(
    studentId: string,
    courseId: string,
  ): Promise<Enrollment | null>;
  findByStudentId(studentId: string): Promise<Enrollment[]>;
  findByStudentIdAndActives(studentId: string): Promise<Enrollment[] | null>;
  findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<Enrollment | null>;
  findByStudentAndCourse_Schedule(
    studentId: string,
    courseId: string,
  ): Promise<Enrollment | null>;
  save(enrollment: Enrollment): Promise<Enrollment>;
  save(enrollment: Enrollment[]): Promise<Enrollment[]>;
  add(enrollment: Enrollment): Promise<Enrollment>;
}
