import type { Classroom } from "./classroom.types";
import type { TeacherProfileDTO } from "./user.types";
import type { AcademicCourseDTO } from "./course.types";

export enum AcademicGroupType {
  LABORATORY = "laboratory",
  THEORY = "theory",
  PRACTICE = "practice",
}

export interface AcademicGroupDTO {
  id: string;
  name: string;
  capacity: number;
  type: string;
  schedule?: ScheduleSlotDTO[];
  course: AcademicCourseDTO;
  teacher?: TeacherProfileDTO;
  enrolledCount?: number;
}

export interface ScheduleSlotDTO {
  id: string;
  day: string;
  start: string;
  end: string;
  classroom: Classroom;
  group: string;
}
