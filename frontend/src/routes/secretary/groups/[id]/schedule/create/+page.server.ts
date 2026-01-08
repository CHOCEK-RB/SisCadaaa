import { classroomService } from "$lib/services/classroom.service";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    const classrooms = await classroomService.getAllClassrooms({ fetch });
    if (!classrooms) {
      error(500, "Error al cargar las aulas.");
    }
    return {
      classrooms,
      groupId: params.id,
    };
  } catch (err: any) {
    console.error(err);
    error(500, "Error al cargar las aulas.");
  }
};

