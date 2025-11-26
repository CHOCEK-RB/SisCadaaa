import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { groupsService } from "$lib/services/groups.service";

export const load: PageServerLoad = async ({ locals, params, fetch }) => {
  if (locals.user?.role !== "teacher") {
    throw redirect(303, "/");
  }

  const groupId = params.academicCourseId;

  try {
    const groupGrades = await groupsService.getGroupGrades(groupId, { fetch });
    return {
      groupId,
      groupGrades,
    };
  } catch (err) {
    console.error(`Error loading group grades for ${groupId}:`, err);
    return {
      groupId,
      groupGrades: null,
      error:
        "No se pudieron cargar las calificaciones del grupo. Intenta de nuevo más tarde.",
    };
  }
};
