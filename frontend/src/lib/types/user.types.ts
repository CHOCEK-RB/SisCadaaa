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

export type TeacherDTO = TeacherProfileDTO;

export interface StudentUserDTO extends UserProfileDTO {
    cui: string;
    semester: number;
}

export interface FindAllUsersOptions {
  role?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface TeacherInfoDTO {
  id: string;
  firstName: string;
  lastName: string;
  secondLastName?: string;
  user?: undefined; // Explicitly undefined as per backend data
}
