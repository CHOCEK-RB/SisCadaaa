import { ReservationStatus } from '../../domain/aggregates/reservation.entity';
import { Role } from '../../../users/domain/aggregates/role.enum';

class UserDto {
  id: string;
  email: string;
  role: Role;
}

class ClassroomDto {
  id: string;
  name: string;
  capacity: number;
}

export class ReservationDto {
  id: string;
  startTime: Date;
  endTime: Date;
  status: ReservationStatus;
  user: UserDto;
  classroom: ClassroomDto;
  createdAt: Date;
}
