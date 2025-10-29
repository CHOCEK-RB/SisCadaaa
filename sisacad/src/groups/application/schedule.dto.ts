import { ClassroomDTO } from 'src/classroom/application/dto/classroom.dto';

export class ScheduleSlotDTO {
  id: string;
  day: string;
  start: string;
  end: string;
  classroom: ClassroomDTO;
  group: string;
}
