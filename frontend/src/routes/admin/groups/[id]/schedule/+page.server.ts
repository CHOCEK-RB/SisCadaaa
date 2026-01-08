import type { PageServerLoad } from "./$types";
import { groupsService } from "$lib/services/groups.service";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ fetch, params }) => {
  const { id } = params; // This is the groupId
  try {
    const groupSchedules = await groupsService.getScheduleForGroup(id, {
      fetch,
    });

    return {
      groupSchedules,
    };
  } catch (e: any) {
    console.error("Error loading group schedule:", e);
    throw error(
      e.status || 500,
      e.body?.message || "Could not load group schedule",
    );
  }
};
