import { Injectable, Inject } from '@nestjs/common';

import * as fs from 'fs';
import * as Papa from 'papaparse';

import * as typeCsv from './csv.types';

import { IAcademicCourseRepository } from 'src/courses/domain/repositories/icourse_academic.repository';
import { ICourseTopicRepository } from 'src/courses/domain/repositories/icourse_topic.repository';

import { CourseTopic } from 'src/courses/domain/aggregates/course_topic.entity';

/**
 * @class SeederTopicsService
 * @description
 * Service responsible for seeding course topics into the database from a CSV file.
 * It associates topics with existing academic courses based on course codes.
 */
@Injectable()
export class SeederTopicsService {
  /**
   * @constructor
   * @param {IAcademicCourseRepository} academicCourseRepository - Repository for academic course data operations.
   * @param {ICourseTopicRepository} courseTopicRepository - Repository for course topic data operations.
   */
  constructor(
    @Inject(IAcademicCourseRepository)
    private readonly academicCourseRepository: IAcademicCourseRepository,
    @Inject(ICourseTopicRepository)
    private readonly courseTopicRepository: ICourseTopicRepository,
  ) {}

  /**
   * @method seedTopics
   * @description
   * Reads topic data from a CSV file, parses it, and seeds course topics into the database.
   * It maps topics to their respective academic courses using course codes, ensuring that
   * only valid topics with proper order and content are created.
   * @param {string} filePath - The path to the CSV file containing topic data.
   * @returns {Promise<void>} A promise that resolves when all course topics have been processed.
   * @throws {Error} If there are errors parsing the CSV file.
   */
  async seedTopics(filePath: string): Promise<void> {
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse<typeCsv.Topic>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error('Errors parsing topics.csv:', parseResult.errors);
      throw new Error('Failed to parse topics.csv file.');
    }

    const topicRows = parseResult.data;
    if (!topicRows || topicRows.length === 0) {
      console.log('No topics found in topics.csv.');
      return;
    }

    const allAcademicCourses = await this.academicCourseRepository.findAll();
    if (!allAcademicCourses || allAcademicCourses.length === 0) {
      console.log('No academic courses found in DB. Skipping topic seeding.');
      return;
    }

    const topicsByCourseCode = new Map<string, typeCsv.Topic[]>();
    for (const row of topicRows) {
      if (!row.code) continue;
      if (!topicsByCourseCode.has(row.code)) {
        topicsByCourseCode.set(row.code, []);
      }
      topicsByCourseCode.get(row.code)!.push(row);
    }

    const topicsToCreate: CourseTopic[] = [];

    for (const ac of allAcademicCourses) {
      if (!ac.course || !ac.course.code) {
        console.warn(
          `AcademicCourse ${ac.id} is missing base course info or code. Skipping topics.`,
        );
        continue;
      }

      const courseCode = ac.course.code;
      const topicsForThisCourse = topicsByCourseCode.get(courseCode);

      if (topicsForThisCourse && topicsForThisCourse.length > 0) {
        for (const topicRow of topicsForThisCourse) {
          const newTopic = new CourseTopic();
          newTopic.topicOrder = parseInt(topicRow.order, 10);
          newTopic.topic = topicRow.topic;
          newTopic.course = ac;

          if (!isNaN(newTopic.topicOrder) && newTopic.topic) {
            topicsToCreate.push(newTopic);
          } else {
            console.warn(
              `Invalid order ('${topicRow.order}') or empty topic for course ${courseCode}. Skipping.`,
            );
          }
        }
      }
    }

    try {
      if (topicsToCreate.length > 0) {
        await this.courseTopicRepository.save(topicsToCreate);
        console.log('Successfully created course topics.');
      } else {
        console.log('No new course topics needed to be created.');
      }
    } catch (error) {
      console.error('Failed to save course topics:', error);
      throw error;
    }
  }
}
