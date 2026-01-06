import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { groupsService } from "$lib/services/groups.service";
import { reservationService } from "$lib/services/reservation.service";

export const load:PageServerLoad = async ({ locals, fetch })=> {
  if (locals.user?.role !== "teacher") {
    throw redirect(303, "/");
  }

  try {
    //const groups = await groupsService.getGroups({ fetch });
    //const groups = await Promise.all([abcgroups]);

    const [groups, schedule, reservations] = await Promise.all([
      groupsService.getGroups({ fetch }),
      groupsService.getTeacherSchedule({ fetch }),
      reservationService.getMyReservations({ fetch })
    ]);
    return {
      groups,
      schedule,
      reservations,
    };
  } catch (err) {
    console.error("Error loading teacher dashboard data:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Error al cargar los datos del panel.";

    return {
      groups: {},
      schedule: [],
      reservations: [],
      error: errorMessage,
    };
  }
};
