import { AcademicCourseDTO } from 'src/courses/application/dto/academic_course.dto';
import { Grades } from '../../aggregates/enrollment.entity';

export class EnrollmentDetailDTO {
  id: string;
  date: string;
  grades: Grades;
  academicCourse: AcademicCourseDTO;
}
