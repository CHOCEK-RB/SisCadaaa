import { Enrollment } from '../aggregates/enrollment.entity';
import { Student } from 'src/users/aggregates/student.entity';
import { AcademicCourse } from 'src/courses/aggregates/academic_course.entity';

export const IEnrollmentRepository = Symbol('IEnrollmentRepository');

export interface IEnrollmentRepository {
  findById(id: string): Promise<Enrollment | null>;
  findAll(): Promise<Enrollment[]>;
  findByStudentId(studentId: string): Promise<Enrollment[]>;
  findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<Enrollment | null>;
  save(enrollment: Enrollment): Promise<Enrollment>;
  save(enrollment: Enrollment[]): Promise<Enrollment[]>;
  create(
    student: Student,
    course: AcademicCourse,
    date: Date,
  ): Promise<Enrollment>;
}
