import { AcademicCourseDTO } from 'src/courses/application/dto/academic_course.dto';
import { Grades } from '../../aggregates/enrollment.entity';
import { StudentProfileDTO } from 'src/users/application/dto/student.dto';

export class EnrollmentDetailDTO {
  id: string;
  student?: StudentProfileDTO;
  date: string;
  grades?: Grades;
  academicCourse: AcademicCourseDTO;
}
