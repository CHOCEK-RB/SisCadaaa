import { classroomService } from "$lib/services/classroom.service";
import { reservationService } from "$lib/services/reservation.service";
import { groupsService } from "$lib/services/groups.service";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const [classrooms, todayReservations, teacherSchedule] = await Promise.all([
      classroomService.getAllClassrooms({ fetch }),
      reservationService.getReservationsForToday({ fetch }),
      groupsService.getTeacherSchedule({ fetch }),
    ]);

    return {
      classrooms: classrooms || [],
      todayReservations: todayReservations || [],
      teacherSchedule: teacherSchedule || [],
    };
  } catch (error) {
    console.error("Error loading reservation data:", error);
    return {
      classrooms: [],
      todayReservations: [],
      teacherSchedule: [],
      error: "No se pudieron cargar los datos para las reservas.",
    };
  }
};
