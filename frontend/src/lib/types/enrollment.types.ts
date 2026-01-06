import type { AcademicCourseDTO } from "./course.types";
import type { StudentProfileDTO } from "./user.types";
import type { GradingScheme } from "./course.types";

export interface Grades {
  firstContinue: number;
  secondContinue: number;
  thirdContinue: number;
  firstPartial: number;
  secondPartial: number;
  thirdPartial: number;
}

export interface GradesAndSchemeDTO {
  grades: Grades;
  scheme: GradingScheme;
}

export interface EnrollmentDetailDTO {
  id: string;
  student?: StudentProfileDTO;
  date: string;
  grades?: Grades;
  academicCourse: AcademicCourseDTO;
}

export interface GroupedEnrollments {
  [period: string]: EnrollmentDetailDTO[];
}
