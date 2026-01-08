import { Injectable, Inject } from "@nestjs/common";
import * as fs from "fs";
import * as Papa from "papaparse";
import { IReservationRepository } from "src/reservation/domain/repositories/ireservation.repository";
import { ITeacherRepository } from "src/users/domain/repositories/iteacher.repository";
import { IClassroomRepository } from "src/classroom/domain/repositories/iclassroom.repository";
import {
  Reservation,
  ReservationStatus,
} from "src/reservation/domain/aggregates/reservation.entity";

@Injectable()
export class SeederReservationService {
  constructor(
    @Inject(IReservationRepository)
    private readonly reservationRepository: IReservationRepository,
    @Inject(ITeacherRepository)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(IClassroomRepository)
    private readonly classroomRepository: IClassroomRepository,
  ) {}

  async seedReservations(filePath: string): Promise<void> {
    const csvFile = fs.readFileSync(filePath, "utf8");
    const parseResult = Papa.parse<any>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    const teachers = (await this.teacherRepository.findAll()) ?? [];

    const cesar = teachers.find(
      (t) => t.name === "JOSE LUIS" && t.firstLastName === "CALIZAYA",
    );

    if (!cesar) {
      throw new Error("No se encontró al docente en la DB.");
    }

    if (!cesar.user) {
      throw new Error(
        'El docente fue encontrado pero su relación "user" es undefined. Verifica que el repositorio cargue las relaciones.',
      );
    }

    const classrooms = (await this.classroomRepository.findAll()) ?? [];
    if (classrooms.length === 0) throw new Error("No hay aulas en la DB.");

    const reservationsToCreate = parseResult.data.map((row) => {
      const reservation = new Reservation();

      reservation.user = cesar.user;
      reservation.classroom =
        classrooms[Math.floor(Math.random() * classrooms.length)];

      reservation.startTime = new Date(row.startTime);
      reservation.endTime = new Date(row.endTime);
      reservation.status =
        row.status === "active"
          ? ReservationStatus.ACTIVE
          : ReservationStatus.CANCELLED;

      reservation.createdAt = new Date(row.createdAt);
      reservation.updatedAt = new Date(row.updatedAt);

      return reservation;
    });

    for (const res of reservationsToCreate) {
      await this.reservationRepository.save(res);
    }

    console.log(
      `✅ Éxito: Se han sembrado ${reservationsToCreate.length} reservaciones.`,
    );
  }
}
