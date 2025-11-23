import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { enrollmentService } from "$lib/services/enrollment.service";

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (locals.user?.role !== "student") {
    throw redirect(303, "/");
  }

  try {
    const allScheduleGroups = await enrollmentService.getMySchedule(fetch);

    return {
      allScheduleGroups,
    };
  } catch (err) {
    console.error("Error loading student schedule page:", err);

    return {
      allScheduleGroups: [],
      error: "Error al cargar tu horario completo. Intenta de nuevo más tarde.",
    };
  }
};

