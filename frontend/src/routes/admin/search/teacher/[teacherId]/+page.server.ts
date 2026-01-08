import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { userService } from "$lib/services/user.service";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { teacherId } = params;

  try {
    const teacher = await userService.getTeacherById(teacherId, { fetch });

    return {
      teacherProfile: {
        ...teacher,
        admissionYear: (teacher as any).admissionYear || 2024,
      }
    };
  } catch (err) {
    console.error("Error cargando profesor:", err);
    throw error(404, "Profesor no encontrado o error en el servidor");
  }
};