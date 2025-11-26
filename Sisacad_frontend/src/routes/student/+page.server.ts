import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { enrollmentService } from "$lib/services/enrollment.service";

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (locals.user?.role !== "student") {
    throw redirect(303, "/");
  }

  try {
    const schedulePromise = enrollmentService.getMySchedule({ fetch });
    const coursesPromise = enrollmentService.getEnrollments({ fetch });

    const [schedule, courses] = await Promise.all([
      schedulePromise,
      coursesPromise,
    ]);

    return {
      schedule,
      courses,
    };
  } catch (err) {
    console.error("Error loading student dashboard data:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Error al cargar los datos del panel.";
    return {
      schedule: [],
      courses: {},
      error: errorMessage,
    };
  }
};
