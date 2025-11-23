import type { AcademicCourseDTO } from "./course.types";
import type { StudentProfileDTO } from "./user.types";

export interface Grades {
  firstContinue: number;
  secondContinue: number;
  thirdContinue: number;
  firstPartial: number;
  secondPartial: number;
  thirdPartial: number;
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
