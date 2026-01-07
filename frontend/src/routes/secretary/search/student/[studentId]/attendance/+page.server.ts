import { error } from "@sveltejs/kit";
import { attendanceService } from "$lib/services/attendance.service";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { studentId } = params;

  try {
    const attendance = await attendanceService.getStudentAttendanceReport(studentId, { fetch });

    return {
      attendance
    };
  } catch (err) {
    console.error("Error al cargar reporte de asistencia:", err);
    return {
      attendance: null
    };
  }
};