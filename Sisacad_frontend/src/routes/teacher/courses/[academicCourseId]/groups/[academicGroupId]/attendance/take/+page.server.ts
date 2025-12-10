import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { groupsService } from "$lib/services/groups.service";

export const load: PageServerLoad = async ({ locals, params, fetch }) => {
  if (locals.user?.role !== "teacher") {
    throw redirect(303, "/");
  }

  const groupId = params.academicGroupId;
  const academicCourseId = params.academicCourseId;

  try {
    const groupData = await groupsService.getGroupGrades(groupId, { fetch });

    return {
      groupId,
      academicCourseId,
      courseCode: groupData.courseCode || "N/A",
      courseName: groupData.courseName || "Curso",
      groupName: groupData.groupName || "Grupo",
      roster: groupData.students || []
    };
  } catch (error) {
    console.error("Error loading group grades for attendance:", error);
    return {
      groupId,
      courseCode: "N/A",
      courseName: "Error de Carga",
      groupName: "---",
      roster: [],
      error: "No se pudo cargar la lista de estudiantes. Intente nuevamente.",
    };
  }
};