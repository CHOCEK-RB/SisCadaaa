import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { groupsService } from "$lib/services/groups.service";

export const load: PageServerLoad = async ({ locals, cookies, params }) => {
  if (locals.user.role !== "teacher") {
    throw redirect(303, "/");
  }

  const token = cookies.get("jwt_token");

  if (!token) {
    throw redirect(303, "/login?redirectTo=/teacher/courses");
  }

  const academicCourseId = params.academicCourseId;

  try {
    const group = await groupsService.getScheduleForGroup(
      academicCourseId,
      token,
    );
    return {
      group,
    };
  } catch (err) {
    console.error("Error loading teacher courses page:", err);
  }
};
