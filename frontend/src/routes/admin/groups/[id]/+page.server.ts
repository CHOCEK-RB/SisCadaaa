import type { PageServerLoad } from "./$types";
import { groupsService } from "$lib/services/groups.service";
import { userService } from "$lib/services/user.service"; // Import userService
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ fetch, params }) => {
  const { id } = params; // This is the groupId
  try {
    const groupInfo = await groupsService.getGroupDetails(id, { fetch }); // Fetch group details
    const students = await groupsService.getStudentsInGroup(id, { fetch });
    const teachersResponse = await userService.getTeachers({
      fetch,
      limit: 1000,
    }); // Fetch all teachers (adjust limit as needed)

    return {
      groupInfo,
      students,
      teachers: teachersResponse.data, // Extract teacher data
    };
  } catch (e: any) {
    console.error("Error loading group data:", e);
    throw error(
      e.status || 500,
      e.body?.message || "Could not load group data",
    );
  }
};
