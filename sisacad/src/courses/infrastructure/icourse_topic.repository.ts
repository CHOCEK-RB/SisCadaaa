import { CourseTopic } from '../aggregates/course_topic.entity';
import { AcademicCourse } from '../aggregates/academic_course.entity';

export const ICourseTopicRepository = Symbol('ICourseTopicRepository');

export interface ICourseTopicRepository {
  findById(id: string): Promise<CourseTopic | null>;
  findByAcademicCourseId(id: string): Promise<CourseTopic[] | null>;
  save(course: CourseTopic): Promise<CourseTopic>;
  save(courses: CourseTopic[]): Promise<CourseTopic[]>;
  create(
    order: number,
    topic: string,
    academicCourse: AcademicCourse,
  ): Promise<CourseTopic>;
}
