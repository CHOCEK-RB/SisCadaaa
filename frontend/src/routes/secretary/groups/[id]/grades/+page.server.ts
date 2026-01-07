import type { PageServerLoad } from "./$types";
import { groupsService } from "$lib/services/groups.service";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ fetch, params }) => {
  const { id } = params; // This is the groupId
  try {
    		const groupGrades = await groupsService.getGroupGradesForSecretary(id, { fetch });
    return {
      groupGrades,
    };
  } catch (e: any) {
    console.error("Error loading group grades:", e);
    throw error(
      e.status || 500,
      e.body?.message || "Could not load group grades",
    );
  }
};
