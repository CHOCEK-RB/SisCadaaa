import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types"; // Cambiado a PageServerLoad
import { userService } from "$lib/services/user.service";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { studentId } = params;

  try {
    // Llamamos al servicio real pasando el fetch de SvelteKit para SSR
    const student = await userService.getStudentById(studentId, { fetch });

    return {
      studentProfile: {
        ...student,
        // Agregamos campos que la UI espera pero quizás la API aún no envía
        admissionYear: (student as any).admissionYear || 2024,
      }
    };
  } catch (err) {
    console.error("Error cargando estudiante:", err);
    throw error(404, "Estudiante no encontrado o error en el servidor");
  }
};