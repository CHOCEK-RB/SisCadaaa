import type { ScheduleSlotDTO } from './group.types';

export interface ClassroomDTO {
  id: string;
  name: string;
  description: string;
  schedule: ScheduleSlotDTO[];
}
