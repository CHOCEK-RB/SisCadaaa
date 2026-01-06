import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { groupsService } from "$lib/services/groups.service";

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (locals.user?.role !== "teacher") {
    throw redirect(303, "/");
  }

  try {
    const groupedCourses = await groupsService.getGroups({ fetch });

    console.log(groupedCourses);

    return {
      groupedCourses,
    };
  } catch (err) {
    console.error("Error loading teacher courses page:", err);

    return {
      groupedCourses: {},
      error: "Error de red al cargar tus cursos. Intenta de nuevo más tarde.",
    };
  }
};
