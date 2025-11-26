import { reservationService } from "$lib/services/reservation.service";
import { groupsService } from "$lib/services/groups.service";
import type { PageServerLoad } from "./$types";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

export const load: PageServerLoad = async (event) => {
  const { user } = event.locals;

  if (!user) {
    return {
      teacherSchedule: [],
      teacherReservations: [],
      error: "Usuario no autenticado.",
    };
  }

  try {
    const [teacherSchedule, allReservations] = await Promise.all([
      groupsService.getTeacherSchedule({ fetch: event.fetch }),
      reservationService.getMyReservations({ fetch: event.fetch }),
    ]);

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const currentWeekReservations =
      allReservations?.filter((res) => {
        const resDate = new Date(res.startTime);
        return isWithinInterval(resDate, { start: weekStart, end: weekEnd });
      }) || [];

    return {
      teacherSchedule: teacherSchedule || [],
      teacherReservations: currentWeekReservations,
    };
  } catch (error) {
    console.error("Error loading teacher schedule data:", error);
    return {
      teacherSchedule: [],
      teacherReservations: [],
      error: "No se pudieron cargar los datos del horario.",
    };
  }
};
