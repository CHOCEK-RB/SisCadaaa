import { AcademicCourseDTO } from './academic_course.dto';

export class CourseDTO {
  id: string;
  name: string;
  code: string;
  semester: number;
  credits: number;
  preRrqs?: CourseDTO[];
  academicCourses?: AcademicCourseDTO[];
}
