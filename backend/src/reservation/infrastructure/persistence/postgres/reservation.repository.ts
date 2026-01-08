import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, MoreThan, Repository } from 'typeorm';
import {
  Reservation,
  ReservationStatus,
} from '../../../domain/aggregates/reservation.entity';
import { IReservationRepository } from '../../../domain/repositories/ireservation.repository';

@Injectable()
export class ReservationPostgresRepository implements IReservationRepository {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  save(reservation: Reservation): Promise<Reservation> {
    return this.reservationRepository.save(reservation);
  }

  findById(id: string): Promise<Reservation | null> {
    return this.reservationRepository.findOneBy({ id });
  }

  findAll(): Promise<Reservation[]> {
    return this.reservationRepository.find();
  }

  findAllActive(): Promise<Reservation[]> {
    return this.reservationRepository.findBy({
      status: ReservationStatus.ACTIVE,
    });
  }

  findByUserId(userId: string): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { user: { id: userId } },
      relations: { classroom: true },
      order: { startTime: "DESC" },
    });
  }

  findByClassroomId(classroomId: string): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { classroom: { id: classroomId } },
    });
  }

  findForToday(): Promise<Reservation[]> {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    return this.reservationRepository.find({
      where: {
        startTime: Between(startOfDay, endOfDay),
      },
    });
  }

  findOverlappingReservations(
    classroomId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: {
        classroom: { id: classroomId },
        status: ReservationStatus.ACTIVE,
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
      },
    });
  }

  findByTeacherId(teacherId: string): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { user: { id: teacherId } },
      relations: {
        classroom: true,
      },
      order: { startTime: "DESC" },
    });
  }
}
