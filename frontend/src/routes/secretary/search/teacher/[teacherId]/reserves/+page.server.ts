import { reservationService } from "$lib/services/reservation.service";
import { userService } from "$lib/services/user.service";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { teacherId } = params;

  try {
    const teacherProfile = await userService.getTeacherById(teacherId, { fetch });
    const reserves = await reservationService.getTeacherHistory(teacherId, { fetch });

    return {
      teacherProfile,
      reserves
    };
  } catch (err) {
    console.error("Error al cargar historial de reservas:", err);
    return {
      teacherProfile: null,
      reserves: []
    };
  }
};