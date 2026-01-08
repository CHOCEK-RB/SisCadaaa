import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { groupsService } from "$lib/services/groups.service";
import { attendanceService } from "$lib/services/attendance.service";

type StudentStats = {
  cui: string;
  name: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
};

function calculateStudentStats(
  enrolledStudents: any[],
  attendanceHistory: any[],
): StudentStats[] {
  const studentMap = new Map<string, any>();

  enrolledStudents.forEach((student: any) => {
    const id = student.studentId || student.id;
    studentMap.set(id, {
      cui: student.cui,
      name: `${student.lastName}, ${student.firstName}`,
      present: 0,
      absent: 0,
      total: 0,
      percentage: 0,
    });
  });

  if (attendanceHistory.length > 0) {
    attendanceHistory.forEach((record) => {
      record.students.forEach((student: any) => {
        if (studentMap.has(student.studentId)) {
          const stats = studentMap.get(student.studentId)!;
          stats.total++;
          if (student.status === "present") stats.present++;
          else stats.absent++;
        }
      });
    });
  }

  return Array.from(studentMap.values())
    .map((stats) => ({
      ...stats,
      percentage:
        stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const load: PageServerLoad = async ({ locals, params, fetch }) => {
  if (locals.user?.role !== "teacher") {
    throw redirect(303, "/");
  }

  const { academicGroupId, academicCourseId } = params;

  try {
    const groupGrades = await groupsService.getGroupGrades(academicGroupId, {
      fetch,
    });
    const attendanceHistory = await attendanceService.getGroupAttendanceHistory(
      academicGroupId,
      { fetch },
    );

    const enrolledStudents = groupGrades.students || [];
    const studentStats = calculateStudentStats(
      enrolledStudents,
      attendanceHistory,
    );

    return {
      academicGroupId,
      academicCourseId,
      groupGrades,
      attendanceHistory,
      studentStats,
    };
  } catch (err: any) {
    console.error("Error loading attendance data:", err);

    return {
      academicGroupId,
      academicCourseId,
      groupGrades: null,
      attendanceHistory: [],
      studentStats: [],
      error:
        err.message ||
        "Error al cargar los datos de asistencia. Intenta de nuevo más tarde.",
    };
  }
};
