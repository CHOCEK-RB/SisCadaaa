import type { Role } from './user.types';

export enum ReservationStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface ReservationUser {
  id: string;
  email: string;
  role: Role;
}

export interface ReservationClassroom {
  id: string;
  name: string;
  capacity: number;
}

export interface Reservation {
  id: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  user: ReservationUser;
  classroom: ReservationClassroom;
  createdAt: string;
}

export interface CreateReservation {
  classroomId: string;
  startTime: string;
  endTime: string;
}