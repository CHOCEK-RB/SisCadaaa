import { ScheduleSlotDTO } from 'src/groups/application/dto/schedule.dto';

export class ClassroomDTO {
  id: string;
  name: string;
  type: string;
  schedule?: ScheduleSlotDTO[];
}
