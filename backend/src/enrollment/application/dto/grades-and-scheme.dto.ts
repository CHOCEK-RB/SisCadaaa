import { Grades } from 'src/enrollment/domain/aggregates/enrollment.entity';
import { GradingScheme } from 'src/courses/domain/aggregates/academic_course.entity';

export class GradesAndSchemeDTO {
  grades: Grades;
  scheme: GradingScheme;
}
