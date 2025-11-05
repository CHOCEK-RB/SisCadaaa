import { CourseDTO } from './course.dto';
import { CourseTopicDTO } from './course_topic.dto';
import { TeacherProfileDTO } from 'src/users/application/dto/teacher.dto';
import { AcademicGroupDTO } from 'src/groups/application/academic_group.dto';
import { GradingScheme } from 'src/courses/aggregates/academic_course.entity';
import { EnrollmentDetailDTO } from 'src/enrollment/application/dto/enrollment.dto';

export class AcademicCourseDTO {
  id: string;
  creationDate?: Date;
  urlSyllabus?: string;
  course: CourseDTO;
  grades?: GradingScheme;

  coordinator?: TeacherProfileDTO;
  groups?: AcademicGroupDTO[];
  topics?: CourseTopicDTO[];
  enrollments?: EnrollmentDetailDTO[];

  currentlyEnrolledLabGroupId?: string | null;
}
