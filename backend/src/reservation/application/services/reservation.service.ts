import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { IReservationRepository } from "../../domain/repositories/ireservation.repository";
import { CreateReservationDto } from "../dto/create-reservation.dto";
import { Reservation } from "../../domain/aggregates/reservation.entity";
import { IUserRepository } from "../../../users/domain/repositories/iuser.repository";
import { IClassroomRepository } from "../../../classroom/domain/repositories/iclassroom.repository";
import { User } from "src/users/domain/aggregates/user.entity";
import { IScheduleSlotRepository } from "src/groups/domain/repositories/ischedule.repository"; // Import
import { DayOfWeek } from "src/groups/domain/aggregates/schedule.entity"; // Import
import { ITeacherRepository } from "src/users/domain/repositories/iteacher.repository";

@Injectable()
export class ReservationService {
  constructor(
    @Inject(IReservationRepository)
    private readonly reservationRepository: IReservationRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IClassroomRepository)
    private readonly classroomRepository: IClassroomRepository,
    @Inject(IScheduleSlotRepository) // Inject
    private readonly scheduleSlotRepository: IScheduleSlotRepository, // Inject
    @Inject(ITeacherRepository)
    private readonly teacherRepository: ITeacherRepository,
  ) {}

  private mapDayNumberToDayOfWeek(dayNumber: number): DayOfWeek | undefined {
    switch (dayNumber) {
      case 1:
        return DayOfWeek.MONDAY;
      case 2:
        return DayOfWeek.TUESDAY;
      case 3:
        return DayOfWeek.WEDNESDAY;
      case 4:
        return DayOfWeek.THURSDAY;
      case 5:
        return DayOfWeek.FRIDAY;
      default:
        // For Saturday (6) and Sunday (0), return undefined as they are not in DayOfWeek enum
        return undefined;
    }
  }

  async createReservation(
    createReservationDto: CreateReservationDto,
    requestingUser: any,
  ): Promise<Reservation> {
    const { classroomId, startTime, endTime } = createReservationDto;

    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);

    if (startTimeDate >= endTimeDate) {
      throw new BadRequestException(
        "La hora de inicio debe ser anterior a la hora de finalización.",
      );
    }

    const classroom = await this.classroomRepository.findById(classroomId);
    if (!classroom) {
      throw new NotFoundException(
        `No se encontró el aula con el id ${classroomId}`,
      );
    }

    // Check for overlapping reservations
    const overlappingReservations =
      await this.reservationRepository.findOverlappingReservations(
        classroomId,
        startTimeDate,
        endTimeDate,
      );

    if (overlappingReservations.length > 0) {
      throw new ConflictException(
        "El aula ya está reservada para este horario.",
      );
    }

    // Check for overlapping academic schedules
    const dayOfWeek = this.mapDayNumberToDayOfWeek(startTimeDate.getDay());
    if (dayOfWeek === undefined) {
      // If it's a weekend, no academic schedule conflict is possible
      // Continue to create reservation without checking academic schedule
    } else {
      const overlappingSchedules =
        await this.scheduleSlotRepository.findOverlappingScheduleSlots(
          classroomId,
          dayOfWeek,
          startTimeDate.toTimeString().slice(0, 5), // Extract HH:mm
          endTimeDate.toTimeString().slice(0, 5), // Extract HH:mm
        );

      if (overlappingSchedules.length > 0) {
        throw new ConflictException(
          "La reserva se superpone con un horario de clase existente.",
        );
      }
    }

    const reservation = new Reservation();
    reservation.classroom = classroom;
    reservation.user = { id: requestingUser.sub || requestingUser.id } as User;
    reservation.startTime = startTimeDate;
    reservation.endTime = endTimeDate;

    return this.reservationRepository.save(reservation);
  }

  async getActiveReservations(): Promise<Reservation[]> {
    return this.reservationRepository.findAllActive();
  }

  async getReservationsByUserId(userId: string): Promise<Reservation[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(
        `No se encontró el usuario con el id ${userId}`,
      );
    }
    return this.reservationRepository.findByUserId(userId);
  }

  async getReservationsByClassroomId(
    classroomId: string,
  ): Promise<Reservation[]> {
    const classroom = await this.classroomRepository.findById(classroomId);
    if (!classroom) {
      throw new NotFoundException(
        `No se encontró el aula con el id ${classroomId}`,
      );
    }
    return this.reservationRepository.findByClassroomId(classroomId);
  }

  async getReservationsForToday(): Promise<Reservation[]> {
    return this.reservationRepository.findForToday();
  }
  async getTeacherReservationHistory(teacherId: string) {
    const teacher = await this.teacherRepository.findById(teacherId);

    if (!teacher || !teacher.user) {
      throw new NotFoundException(
        `Perfil de docente con ID ${teacherId} no encontrado`,
      );
    }

    const userId = teacher.user.id;

    const reservations = await this.reservationRepository.findByUserId(userId);

    return reservations.map((res) => {
      const date = new Date(res.startTime);
      let year = date.getFullYear();
      const month = date.getMonth();

      let periodLetter = "B";

      if (month >= 2 && month <= 6) {
        periodLetter = "A";
      } else if (month <= 1) {
        year -= 1;
        periodLetter = "B";
      } else {
        periodLetter = "B";
      }
      const academicPeriod = `${year}-${periodLetter}`;
      return {
        id: res.id,
        startTime: res.startTime,
        endTime: res.endTime,
        status: res.status,
        classroom: {
          name: res.classroom?.name ?? "Aula no asignada",
        },
        academicPeriod,
      };
    });
  }
  async getTeacherReservationsForSchedule(teacherId: string) {
    const teacher = await this.teacherRepository.findById(teacherId);
    if (!teacher || !teacher.user)
      throw new NotFoundException("Docente no encontrado");

    const reservations = await this.reservationRepository.findByUserId(
      teacher.user.id,
    );

    return reservations.map((res) => ({
      id: res.id,
      startTime: res.startTime,
      endTime: res.endTime,
      status: res.status,
      classroom: { name: res.classroom?.name ?? "Sin Aula" },
    }));
  }
}
