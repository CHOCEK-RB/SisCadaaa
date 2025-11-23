import { Injectable, Inject } from '@nestjs/common';

import { IAcademicCourseRepository } from 'src/courses/domain/repositories/icourse_academic.repository';
import { ICourseRepository } from 'src/courses/domain/repositories/icourse.repository';

import { AcademicCourse } from 'src/courses/domain/aggregates/academic_course.entity';

/**
 * @class SeederAcademicCoursesService
 * @description
 * Service responsible for seeding academic course offerings into the database.
 * It creates multiple academic course instances (Spring and Fall semesters) for
 * each course in the catalog, spanning several years, and assigns default grade weights.
 */
@Injectable()
export class SeederAcademicCoursesService {
  /**
   * @constructor
   * @param {ICourseRepository} courseRepository - Repository for base course data operations.
   * @param {IAcademicCourseRepository} academicCourseRepository - Repository for academic course offering data operations.
   */
  constructor(
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
    @Inject(IAcademicCourseRepository)
    private readonly academicCourseRepository: IAcademicCourseRepository,
  ) {}
  /**
   * @method seedAcademicCourses
   * @description
   * Seeds academic course offerings for all available courses in the catalog.
   * For each course, it generates academic course instances for both Spring (March) and Fall (August)
   * semesters across a range of years (2021-2025), assigning default grade weights.
   * Logs the number of academic course offerings created or a message if none are needed.
   * @returns {Promise<void>} A promise that resolves when all academic course offerings have been seeded.
   */
  async seedAcademicCourses(): Promise<void> {
    const courses = await this.courseRepository.findAll();

    if (!courses || courses.length === 0) {
      console.log('No courses found in the catalog to seed academic courses.');
      return;
    }

    const academicCoursesToCreate: AcademicCourse[] = [];

    for (const course of courses) {
      for (let year = 2021; year <= 2025; year++) {
        const academicCourseSpring = new AcademicCourse();
        academicCourseSpring.course = course;
        academicCourseSpring.creationDate = new Date(`${year}-03-01`);
        academicCourseSpring.grades = {
          firstContinue: 15,
          secondContinue: 15,
          thirdContinue: 20,
          firstPartial: 15,
          secondPartial: 15,
          thirdPartial: 20,
        };
        academicCoursesToCreate.push(academicCourseSpring);

        const academicCourseFall = new AcademicCourse();
        academicCourseFall.course = course;
        academicCourseFall.creationDate = new Date(`${year}-08-01`);
        academicCourseFall.grades = {
          firstContinue: 15,
          secondContinue: 15,
          thirdContinue: 20,
          firstPartial: 15,
          secondPartial: 15,
          thirdPartial: 20,
        };
        academicCoursesToCreate.push(academicCourseFall);
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
}
