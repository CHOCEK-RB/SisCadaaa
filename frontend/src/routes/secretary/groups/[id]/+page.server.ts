import type { PageServerLoad } from "./$types";
import { groupsService } from "$lib/services/groups.service";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ fetch, params }) => {
  const { id } = params;
  try {
    const students = await groupsService.getStudentsInGroup(id, { fetch });
    return {
      students,
    };
  } catch (e: any) {
    console.error("Error loading students for group:", e);
    throw error(
      e.status || 500,
      e.body?.message || "Could not load student data",
    );
  }
};
