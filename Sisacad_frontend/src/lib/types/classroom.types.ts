import type { AcademicGroupDTO } from "./group.types";
import type { Reservation } from "./reservation.types";

export enum ClassroomType {
  LABORATORY = 'laboratory',
  NORMAL = 'normal',
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: ClassroomType;
}

export interface ClassroomSchedule {
    academicGroups: AcademicGroupDTO[];
    reservations: Reservation[];
}
