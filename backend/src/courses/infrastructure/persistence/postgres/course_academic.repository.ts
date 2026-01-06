import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';

import { AcademicCourse } from 'src/courses/domain/aggregates/academic_course.entity';
import { IAcademicCourseRepository } from 'src/courses/domain/repositories/icourse_academic.repository';

@Injectable()
export class AcademicCourseRepository implements IAcademicCourseRepository {
  constructor(
    @InjectRepository(AcademicCourse)
    private readonly typeormRepo: Repository<AcademicCourse>,
  ) {}

  async findById(id: string): Promise<AcademicCourse | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: {
        coordinator: true,
        course: true,
        topics: true,
        progress: true,
      },
      order: {
        topics: {
          topicOrder: 'ASC',
        },
      },
    });
  }

  async findByIdWithCoordinator(id: string): Promise<AcademicCourse | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: ['course', 'topics', 'coordinator'],
      order: {
        topics: {
          topicOrder: 'ASC',
        },
      },
    });
  }

  async findByIdAndStudentId(
    id: string,
    studentId: string,
  ): Promise<AcademicCourse | null> {
    return this.typeormRepo.findOne({
      where: { id, enrollments: { student: { id: studentId } } },
      relations: {
        course: true,
        enrollments: { groups: { teacher: true } },
      },
    });
  }

  async findCreatedAfterDate(date: Date): Promise<AcademicCourse[] | null> {
    const results = await this.typeormRepo.find({
      where: {
        creationDate: MoreThan(date),
      },
      relations: {
        course: true,
        enrollments: { student: true, groups: { teacher: true } },
      },
    });
    return results.length > 0 ? results : null;
  }

  async findAll(): Promise<AcademicCourse[]> {
    return this.typeormRepo.find({ relations: { course: true } });
  }

  async findAllWithTopics(): Promise<AcademicCourse[]> {
    return this.typeormRepo.find({ relations: { course: true, topics: true } });
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

  async add(academicCourse: AcademicCourse): Promise<AcademicCourse> {
    return this.typeormRepo.save(academicCourse);
  }
}
