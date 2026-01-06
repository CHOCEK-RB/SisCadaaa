import { AcademicCourseDTO } from "src/courses/application/dto/academic_course.dto";
import { Grades } from "../../domain/aggregates/enrollment.entity";
import { GradingScheme } from "src/courses/domain/aggregates/academic_course.entity";

export class GradesAndPercentResponseDto {
  course: AcademicCourseDTO;
  grades: Grades;
  percent: GradingScheme;
}
