import { CourseDTO } from "./course.dto";
import { CourseTopicDTO } from "./course_topic.dto";
import { TeacherProfileDTO } from "src/users/application/dto/teacher.dto";
import { AcademicGroupDTO } from "src/groups/application/dto/academic_group.dto";
import { GradingScheme } from "src/courses/domain/aggregates/academic_course.entity";
import { EnrollmentDetailDTO } from "src/enrollment/application/dto/enrollment.dto";
import { TopicProgressDTO } from "./topic_progress.dto";
import { GlobalEvent } from "src/events/domain/aggregates/global_event.entity";

export class AcademicCourseDTO {
  id: string;
  creationDate?: Date;
  urlSyllabus?: string;
  course: CourseDTO;
  grades?: GradingScheme;

  coordinator?: TeacherProfileDTO;
  groups?: AcademicGroupDTO[];
  topics?: CourseTopicDTO[];
  progress?: TopicProgressDTO[];
  enrollments?: EnrollmentDetailDTO[];
  academicPeriod?: GlobalEvent;

  currentlyEnrolledLabGroupId?: string | null;
}
