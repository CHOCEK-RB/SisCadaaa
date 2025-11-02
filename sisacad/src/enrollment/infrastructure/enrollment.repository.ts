import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatus } from '../aggregates/enrollment.entity';
import { IEnrollmentRepository } from './ienrollment.repository';
import { Student } from 'src/users/aggregates/student.entity';
import { AcademicCourse } from 'src/courses/aggregates/academic_course.entity';

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(
    @InjectRepository(Enrollment)
    private readonly typeormRepo: Repository<Enrollment>,
  ) {}

  async findById(id: string): Promise<Enrollment | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: { student: true, groups: true, course: { course: true } },
    });
  }

  async findAll(): Promise<Enrollment[]> {
    return this.typeormRepo.find({
      relations: { student: true, groups: true, course: { course: true } },
    });
  }

  async findAllWithGradesByStudent(studentId: string): Promise<Enrollment[]> {
    return this.typeormRepo.find({
      where: { student: { id: studentId } },
      relations: {
        student: true,
        course: { course: true },
      },
    });
  }

  async findByStudentId(studentId: string): Promise<Enrollment[]> {
    return this.typeormRepo.find({
      where: { student: { id: studentId } },
      relations: {
        groups: { schedule: true },
        course: {
          course: true,
          coordinator: true,
        },
      },
      order: {
        course: { creationDate: 'DESC' },
      },
    });
  }

  async findByStudentIdAndActives(
    studentId: string,
  ): Promise<Enrollment[] | null> {
    return this.typeormRepo.find({
      where: {
        student: { id: studentId },
        status: EnrollmentStatus.ACTIVE,
      },
      relations: {
        student: true,
        groups: {
          schedule: { classroom: true },
          academicCourse: { course: true },
        },
      },
      order: {
        course: { course: { id: 'ASC' } },
        groups: { schedule: { startTime: 'ASC' } },
      },
    });
  }

  async findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    return this.typeormRepo.findOne({
      where: {
        student: { id: studentId },
        course: { id: courseId },
      },

      relations: { student: true, groups: true, course: { course: true } },
      order: {
        groups: { schedule: { startTime: 'ASC' } },
      },
    });
  }

  async findByStudentAndCourse_Schedule(
    studentId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    return this.typeormRepo.findOne({
      where: {
        student: { id: studentId },
        course: { id: courseId },
      },

      relations: {
        student: true,
        groups: {
          schedule: { classroom: true },
          academicCourse: { course: true },
        },
        course: { course: true },
      },
    });
  }

  save(enrollment: Enrollment): Promise<Enrollment>;
  save(enrollment: Enrollment[]): Promise<Enrollment[]>;
  async save(
    enrollmentOrEnrollments: Enrollment | Enrollment[],
  ): Promise<Enrollment | Enrollment[]> {
    if (Array.isArray(enrollmentOrEnrollments)) {
      return this.typeormRepo.save(enrollmentOrEnrollments);
    } else {
      return this.typeormRepo.save(enrollmentOrEnrollments);
    }
  }

  async create(
    student: Student,
    course: AcademicCourse,
    date: Date,
  ): Promise<Enrollment> {
    const enrollmentDateString = date.toISOString();
    const newEnrollment = this.typeormRepo.create({
      student: student,
      course: course,
      date: enrollmentDateString,
    });
    return this.typeormRepo.save(newEnrollment);
  }
}
