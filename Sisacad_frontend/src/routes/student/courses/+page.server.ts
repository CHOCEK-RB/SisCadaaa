import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { enrollmentService } from "$lib/services/enrollment.service";

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (locals.user?.role !== "student") {
    throw redirect(303, "/");
  }

  try {
    const groupedEnrollments = await enrollmentService.getEnrollments(fetch);

    return {
      groupedEnrollments,
    };
  } catch (err) {
    console.error("Error in /student/courses load function:", err);
    return {
      groupedEnrollments: null,
      error: "No se pudieron cargar los cursos.",
    };
  }
};

