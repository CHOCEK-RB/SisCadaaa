import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params, cookies }) => {
  if (locals.user?.role !== "teacher") {
    throw redirect(303, "/");
  }

  const token = cookies.get("jwt_token");
  if (!token) {
    throw redirect(303, "/login?redirectTo=/teacher/courses");
  }

  const groupId = params.academicCourseId;

  return {
    groupId,
  };
};
