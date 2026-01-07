import { Injectable, Inject, NotFoundException } from "@nestjs/common"; // Added NotFoundException

import { IAcademicCourseRepository } from "src/courses/domain/repositories/icourse_academic.repository";
import { ICourseRepository } from "src/courses/domain/repositories/icourse.repository";
import { IGlobalEventRepository } from "src/events/domain/repositories/iglobal_event.repository"; // Added

import { AcademicCourse } from "src/courses/domain/aggregates/academic_course.entity";
import {
  GlobalEvent,
  EventType,
} from "src/events/domain/aggregates/global_event.entity"; // Added

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
   * @param {IGlobalEventRepository} eventRepository - Repository for global event data operations. // Added
   */
  constructor(
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
    @Inject(IAcademicCourseRepository)
    private readonly academicCourseRepository: IAcademicCourseRepository,
    @Inject(IGlobalEventRepository) // Added
    private readonly eventRepository: IGlobalEventRepository, // Added
  ) {}

  // Helper function to find the academic period for a given date
  private getAcademicPeriodForDate(
    date: Date,
    academicPeriods: GlobalEvent[],
  ): GlobalEvent {
    // Make a copy to avoid mutating the original date
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0); // Normalize target date

    for (const period of academicPeriods) {
      // Make copies to avoid mutating period dates
      const periodStart = new Date(period.startDate);
      periodStart.setUTCHours(0, 0, 0, 0); // Normalize period start date

      const periodEnd = new Date(period.endDate);
      periodEnd.setUTCHours(0, 0, 0, 0); // Normalize period end date

      if (targetDate >= periodStart && targetDate <= periodEnd) {
        return period;
      }
    }
    throw new NotFoundException(
      `No academic period found for date: ${date.toISOString().split("T")[0]}. Please ensure all academic courses fall within a defined academic period.`,
    );
  }

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
    const academicPeriods = await this.eventRepository.findAllByType(
      EventType.ACADEMIC,
    ); // Changed from find to findAllByType

    if (!courses || courses.length === 0) {
      console.log("No courses found in the catalog to seed academic courses.");
      return;
    }
    if (!academicPeriods || academicPeriods.length === 0) {
      throw new NotFoundException(
        "No ACADEMIC type global events found. Please seed academic periods first.",
      );
    }

    const academicCoursesToCreate: AcademicCourse[] = [];

    for (const course of courses) {
      for (let year = 2021; year <= 2025; year++) {
        // Spring/A period is for ODD semesters
        if (course.semester % 2 !== 0) {
          const springCreationDate = new Date(`${year}-02-01T00:00:00Z`);
          const academicCourseSpring = new AcademicCourse();
          academicCourseSpring.course = course;
          academicCourseSpring.creationDate = springCreationDate;
          academicCourseSpring.grades = {
            firstContinue: 15,
            secondContinue: 15,
            thirdContinue: 20,
            firstPartial: 15,
            secondPartial: 15,
            thirdPartial: 20,
          };
          academicCourseSpring.academicPeriod = this.getAcademicPeriodForDate(
            springCreationDate,
            academicPeriods,
          );
          academicCoursesToCreate.push(academicCourseSpring);
        }

        // Fall/B period is for EVEN semesters
        if (course.semester % 2 === 0) {
          const fallCreationDate = new Date(`${year}-08-01T00:00:00Z`);
          const academicCourseFall = new AcademicCourse();
          academicCourseFall.course = course;
          academicCourseFall.creationDate = fallCreationDate;
          academicCourseFall.grades = {
            firstContinue: 15,
            secondContinue: 15,
            thirdContinue: 20,
            firstPartial: 15,
            secondPartial: 15,
            thirdPartial: 20,
          };
          academicCourseFall.academicPeriod = this.getAcademicPeriodForDate(
            fallCreationDate,
            academicPeriods,
          );

          console.log(academicCourseFall.academicPeriod);
          academicCoursesToCreate.push(academicCourseFall);
        }
      }
    }

    try {
      if (academicCoursesToCreate.length > 0) {
        await this.academicCourseRepository.save(academicCoursesToCreate);
        console.log(
          `Successfully created ${academicCoursesToCreate.length} academic course offerings.`,
        );
      } else {
        console.log("No new academic course offerings to create.");
      }
    } catch (error) {
      console.error("Failed to save academic courses:", error);
    }
  }
}
