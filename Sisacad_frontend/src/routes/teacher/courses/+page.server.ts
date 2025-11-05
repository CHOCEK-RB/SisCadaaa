import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { groupsService } from "$lib/services/groups.service";

export const load: PageServerLoad = async ({ locals, cookies }) => {
  if (locals.user.role !== "teacher") {
    throw redirect(303, "/");
  }

  const token = cookies.get("jwt_token");

  if (!token) {
    throw redirect(303, "/login?redirectTo=/teacher/courses");
  }

  try {
    const groups = await groupsService.getGroups(token);
    return {
      groups,
    };
  } catch (err) {
    console.error("Error loading teacher courses page:", err);
  }
};
