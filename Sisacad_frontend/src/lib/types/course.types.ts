import type { TeacherProfileDTO } from './user.types';
import type { AcademicGroupDTO } from './group.types';
import type { EnrollmentDetailDTO } from './enrollment.types';

export interface AcademicCourseDTO {
  id: string;
  creationDate: Date;
  urlSyllabus?: string;
  course: CourseDTO;
  grades?: GradingScheme;

  coordinator?: TeacherProfileDTO;
  groups?: AcademicGroupDTO[];
  topics?: CourseTopicDTO[];
  enrollments?: EnrollmentDetailDTO[];
}

export interface GradingScheme {
  firstContinue: number;
  secondContinue: number;
  thirdContinue: number;
  firstPartial: number;
  secondPartial: number;
  thirdPartial: number;
}

export interface CourseDTO {
  id: string;
  name: string;
  code: string;
  semester: number;
  credits: number;
  preRrqs?: CourseDTO[];
  academicCourses?: AcademicCourseDTO[];
}

export interface CourseTopicDTO {
  id: string;
  order: number;
  topic: string;
}
