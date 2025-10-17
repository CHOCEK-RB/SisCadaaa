import { Injectable, Inject } from '@nestjs/common';

import { AcademicCourse } from 'src/courses/aggregates/academic_course.entity';

import { ISeederServiceAcademic } from './iseeder_academic.service';

import { ICourseRepository } from 'src/courses/infrastructure/icourse.repository';
import { IAcademicCourseRepository } from 'src/courses/infrastructure/icourse_academic.repository';

@Injectable()
export class SeeederServiceAcademic implements ISeederServiceAcademic {
  constructor(
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
    @Inject(IAcademicCourseRepository)
    private readonly academicCourseRepository: IAcademicCourseRepository,
  ) {}

  async seedAcademicCourses(): Promise<void> {
    const courses = await this.courseRepository.findAll();

    if (!courses || courses.length === 0) {
      console.log('No courses found in the catalog to seed academic courses.');
      return;
    }

    const academicCoursesToCreate: AcademicCourse[] = [];

    for (const course of courses) {
      for (let i = 0; i < 10 - course.semester + 1; i++) {
        const academicCourse = new AcademicCourse();
        academicCourse.course = course;

        const currentYear = 2025 - Math.floor((10 - course.semester - i) / 2);
        const isFirstSemester = (course.semester + i) % 2 !== 0;

        if (isFirstSemester) {
          academicCourse.creationDate = new Date(`${currentYear}-03-01`);
        } else {
          academicCourse.creationDate = new Date(`${currentYear}-08-01`);
        }

        academicCoursesToCreate.push(academicCourse);
      }
    }

    try {
      if (academicCoursesToCreate.length > 0) {
        await this.academicCourseRepository.save(academicCoursesToCreate);
        console.log(
          `Successfully created ${academicCoursesToCreate.length} academic course offerings.`,
        );
      } else {
        console.log('No new academic course offerings to create.');
      }
    } catch (error) {
      console.error('Failed to save academic courses:', error);
    }
  }
  async runAll(): Promise<void> {
    await this.seedAcademicCourses();
    return;
  }
}
