import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { enrollmentService } from "$lib/services/enrollment.service";

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (locals.user?.role !== "student") {
    throw redirect(303, "/");
  }

  try {
    const allGrades = await enrollmentService.getAllMyGrades({ fetch });
    return {
      allGrades,
    };
  } catch (err) {
    console.error("Error loading student grades page:", err);
    return {
      allGrades: [],
      error: "Error al cargar tus calificaciones. Intenta de nuevo más tarde.",
    };
  }
};
