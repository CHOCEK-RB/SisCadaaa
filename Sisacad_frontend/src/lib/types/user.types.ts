import type { UserProfileDTO } from './auth.types';
import type { AcademicCourseDTO } from './course.types';
import type { AcademicGroupDTO } from './group.types';
import type { EnrollmentDetailDTO } from './enrollment.types';

export interface StudentProfileDTO extends UserProfileDTO {
  cui: string;
  semester: number;
  enrollments?: EnrollmentDetailDTO[];
}

export interface TeacherProfileDTO extends UserProfileDTO {
  coordinatedCourses?: AcademicCourseDTO[];
  teachingGroups?: AcademicGroupDTO[];
}
