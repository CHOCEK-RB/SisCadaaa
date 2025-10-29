import { ScheduleSlotDTO } from 'src/groups/application/schedule.dto';

export class ClassroomDTO {
  id: string;
  name: string;
  description: string;
  schedule: ScheduleSlotDTO[];
}
