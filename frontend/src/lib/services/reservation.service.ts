import { api } from "./api.service";
import type {
  CreateReservation,
  Reservation,
} from "$lib/types/reservation.types";
import type { RequestOptions } from "./api.service";

const BASE_ENDPOINT = "/reservations";

export const reservationService = {
  async createReservation(
    reservationData: CreateReservation,
    options: RequestOptions = {},
  ): Promise<Reservation | null> {
    return await api.post<Reservation>(BASE_ENDPOINT, reservationData, options);
  },

  async getActiveReservations(
    options: RequestOptions = {},
  ): Promise<Reservation[] | null> {
    return await api.get<Reservation[]>(`${BASE_ENDPOINT}/active`, options);
  },

  async getReservationsForToday(
    options: RequestOptions = {},
  ): Promise<Reservation[] | null> {
    return await api.get<Reservation[]>(`${BASE_ENDPOINT}/today`, options);
  },

  async getMyReservations(
    options: RequestOptions = {},
  ): Promise<Reservation[] | null> {
    return await api.get<Reservation[]>(
      `${BASE_ENDPOINT}/my-reservations`,
      options,
    );
  },

  async getReservationsByClassroomId(
    classroomId: string,
    options: RequestOptions = {},
  ): Promise<Reservation[] | null> {
    return await api.get<Reservation[]>(
      `${BASE_ENDPOINT}/classroom/${classroomId}`,
      options,
    );
  },
  
  
  async getTeacherHistory(userId: string, options: RequestOptions = {}) {
    return await api.get<any[]>(`/reservations/teacher/${userId}/history`, options);
  }
};
