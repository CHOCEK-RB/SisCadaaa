import type { TeacherInfoDTO } from "./user.types";
import type { AcademicGroupDTO } from "./group.types";
import type { EnrollmentDetailDTO } from "./enrollment.types";
import type { GlobalEvent } from "./event.types";

export interface AcademicCourseDTO {
  id: string;
  creationDate: Date;
  urlSyllabus?: string;
  course: CourseDTO;
  grades?: GradingScheme;

  progress?: TopicProgressDTO[];

  coordinator?: TeacherInfoDTO;
  groups?: AcademicGroupDTO[];
  topics?: CourseTopicDTO[];
  enrollments?: EnrollmentDetailDTO[];

  currentlyEnrolledLabGroupId?: string;
  academicPeriod: GlobalEvent;
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

export interface TopicProgressDTO {
  id: string;
  groupName: string;
  completedTopics: CourseTopicDTO[];
}
