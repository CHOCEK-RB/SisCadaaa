import { Injectable, Inject } from '@nestjs/common';

import * as fs from 'fs';
import * as Papa from 'papaparse';

import * as typeCsv from './csv.types';

import { ICourseRepository } from 'src/courses/domain/repositories/icourse.repository';

import { Course } from 'src/courses/domain/aggregates/course.entity';

/**
 * @class SeederCoursesService
 * @description
 * Service responsible for seeding course data into the database from a CSV file.
 * It creates new courses, assigns credits and semester information, and links prerequisites
 * between courses based on the provided CSV data.
 */
@Injectable()
export class SeederCoursesService {
  /**
   * @constructor
   * @param {ICourseRepository} courseRepository - Repository for course data operations.
   */
  constructor(
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
  ) {}
  /**
   * @method seedCourses
   * @description
   * Reads course data from a CSV file, parses it, and seeds courses into the database.
   * It first creates all courses, then iterates again to link prerequisites based on course codes.
   * Logs success messages and any parsing errors encountered.
   * @param {string} filePath - The path to the CSV file containing course data.
   * @returns {Promise<void>} A promise that resolves when all course data and their prerequisites have been processed.
   * @throws {Error} If there are errors parsing the CSV file.
   */
  async seedCourses(filePath: string): Promise<void> {
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse<typeCsv.Course>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error('Errors parsing CSV:', parseResult.errors);
      throw new Error('Failed to parse CSV file.');
    }

    const courseRows = parseResult.data;

    const coursesToCreate = courseRows.map((row) => {
      const course = new Course();
      course.code = row.code;
      course.name = row.name;
      course.credits = parseInt(row.credits, 10);
      course.semester = parseInt(row.semester, 10);
      course.preRrqs = [];
      return course;
    });

    const savedCourses = await this.courseRepository.save(coursesToCreate);
    console.log(`Created ${savedCourses.length} courses.`);

    const coursesMap = new Map<string, Course>();
    savedCourses.forEach((course) => coursesMap.set(course.code, course));

    const coursesToUpdate: Course[] = [];

    for (const row of courseRows) {
      const mainCourse = coursesMap.get(row.code);
      if (!mainCourse) continue;

      const prerequisites: Course[] = [];

      if (row.prrq_1) {
        const prereq1 = coursesMap.get(row.prrq_1);
        if (prereq1) {
          prerequisites.push(prereq1);
        }
      }

      if (row.prrq_2) {
        const prereq2 = coursesMap.get(row.prrq_2);
        if (prereq2) {
          prerequisites.push(prereq2);
        }
      }

      if (prerequisites.length > 0) {
        mainCourse.preRrqs = prerequisites;
        coursesToUpdate.push(mainCourse);
      }
    }

    if (coursesToUpdate.length > 0) {
      await this.courseRepository.save(coursesToUpdate);
      console.log(
        `Linked prerequisites for ${coursesToUpdate.length} courses.`,
      );
    }

    console.log('Course seeding completed successfully!');
  }
}
