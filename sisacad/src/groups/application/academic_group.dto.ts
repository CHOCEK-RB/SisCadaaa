import { ScheduleSlotDTO } from './schedule.dto';
import { AcademicCourseDTO } from 'src/courses/application/dto/academic_course.dto';
import { TeacherProfileDTO } from 'src/users/application/dto/teacher.dto';
import { EnrollmentDetailDTO } from 'src/enrollment/application/dto/enrollment.dto';

export class AcademicGroupDTO {
  id: string;
  name: string;
  capacity?: number;
  type: string;
  schedule?: ScheduleSlotDTO[];
  course?: AcademicCourseDTO;
  teacher?: TeacherProfileDTO;
  enrollments?: EnrollmentDetailDTO[];
  enrollmentsCount?: number;
}
