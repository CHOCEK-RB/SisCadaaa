import { Injectable, Inject } from '@nestjs/common';
import { IAcademicCourseRepository } from 'src/courses/domain/repositories/icourse_academic.repository';
import { ITopicProgressRepository } from 'src/courses/domain/repositories/itopic_progress.repository';
import { TopicProgress } from 'src/courses/domain/aggregates/topic_progress.entity';

/**
 * @class SeederTopicProgressService
 * @description
 * Service responsible for seeding initial topic progress records for academic courses.
 * It simulates partial completion of topics for a specific academic period (e.g., 2025-B)
 * for different academic groups.
 */
@Injectable()
export class SeederTopicProgressService {
  /**
   * @constructor
   * @param {IAcademicCourseRepository} academicCourseRepo - Repository for academic course data operations.
   * @param {ITopicProgressRepository} topicProgressRepo - Repository for topic progress data operations.
   */
  constructor(
    @Inject(IAcademicCourseRepository)
    private readonly academicCourseRepo: IAcademicCourseRepository,
    @Inject(ITopicProgressRepository)
    private readonly topicProgressRepo: ITopicProgressRepository,
  ) {}

  /**
   * @method seedTopicProgress
   * @description
   * Seeds initial topic progress records for academic courses, specifically targeting
   * courses from the 2025-B academic period. It creates progress records for
   * shared academic groups ('A' and 'B'), marking the first two topics as completed.
   * @returns {Promise<void>} A promise that resolves when topic progress records have been created.
   */
  async seedTopicProgress(): Promise<void> {
    console.log('Seeding topic progress...');

    const allCourses = await this.academicCourseRepo.findAllWithTopics();
    const courses2025B = allCourses.filter((ac) => {
      const creationDate = new Date(ac.creationDate);
      return (
        creationDate.getUTCFullYear() === 2025 &&
        creationDate.getUTCMonth() === 7
      );
    });

    if (courses2025B.length === 0) {
      console.log(
        'No academic courses found for 2025-B. Skipping progress seeding.',
      );
      return;
    }

    const progressToCreate: TopicProgress[] = [];

    for (const course of courses2025B) {
      if (!course.topics || course.topics.length === 0) {
        continue;
      }

      const sortedTopics = [...course.topics].sort(
        (a, b) => a.topicOrder - b.topicOrder,
      );

      const sharedGroupNames = ['A', 'B'];

      for (const groupName of sharedGroupNames) {
        const newProgress = new TopicProgress();
        newProgress.academicCourse = course;
        newProgress.groupName = groupName;

        newProgress.completedTopics = sortedTopics.slice(0, 2);

        progressToCreate.push(newProgress);
      }
    }

    if (progressToCreate.length > 0) {
      await this.topicProgressRepo.save(progressToCreate);
      console.log(
        `Successfully created ${progressToCreate.length} topic progress records.`,
      );
    } else {
      console.log('No topic progress records to create.');
    }
  }
}
