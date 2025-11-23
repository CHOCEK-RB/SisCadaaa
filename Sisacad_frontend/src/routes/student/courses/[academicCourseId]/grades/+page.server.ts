import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { enrollmentService } from "$lib/services/enrollment.service";

export const load: PageServerLoad = async ({ locals, params, fetch }) => {
  if (locals.user?.role !== "student") {
    throw redirect(303, "/");
  }

  const { academicCourseId } = params;

  try {
    const grades = await enrollmentService.getGradeById(
      academicCourseId,
      fetch,
    );
    return { grades };
  } catch (err) {
    console.error("Error loading grades page:", err);
    return {
      grades: null,
      error:
        "Error de conexión: No se pudo cargar la información. Intenta de nuevo más tarde.",
    };
  }
};

