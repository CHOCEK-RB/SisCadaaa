import { Reservation } from '../aggregates/reservation.entity';

export interface IReservationRepository {
  save(reservation: Reservation): Promise<Reservation>;
  findById(id: string): Promise<Reservation | null>;
  findAll(): Promise<Reservation[]>;
  findAllActive(): Promise<Reservation[]>;
  findByUserId(userId: string): Promise<Reservation[]>;
  findByClassroomId(classroomId: string): Promise<Reservation[]>;
  findForToday(): Promise<Reservation[]>;
  findOverlappingReservations(
    classroomId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Reservation[]>;
}

export const IReservationRepository = Symbol('IReservationRepository');
