import { error } from "@sveltejs/kit";
import { enrollmentService } from "$lib/services/enrollment.service";
import { userService } from "$lib/services/user.service";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { studentId } = params;
  try {
    const studentProfile = await userService.getStudentById(studentId, { fetch });
    
    const gradesData = await enrollmentService.getGradesByStudentId(studentId, { fetch });

    return {
      studentProfile,
      gradesData: { enrollments: gradesData }
    };
  } catch (err) {
    console.error("Error al cargar notas:", err);
    return { studentProfile: null, gradesData: null };
  }
};