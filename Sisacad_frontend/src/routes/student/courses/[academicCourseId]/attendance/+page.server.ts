import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { attendanceService } from "$lib/services/attendance.service";

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
  if (locals.user?.role !== "student") {
    throw redirect(303, "/");
  }

  const { academicCourseId } = params;

  try {
    const attendanceData = await attendanceService.getGroupAttendance(
      academicCourseId,
      { fetch },
    );

    return {
      attendanceData,
    };
  } catch (err) {
    console.error("Error loading attendance page:", err);

    return {
      attendanceData: [],
      error: "Error de red al cargar la asistencia. Intenta de nuevo.",
    };
  }
};
