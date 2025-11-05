import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { groupsService } from "$lib/services/groups.service";

export const load: PageServerLoad = async ({ locals, params, cookies }) => {
  if (locals.user?.role !== "teacher") {
    throw redirect(303, "/");
  }

  const token = cookies.get("jwt_token");
  if (!token) {
    throw redirect(303, "/login?redirectTo=/teacher/courses");
  }

  const groupId = params.academicCourseId;

  try {
    const groupInfo = await groupsService.getAcademicCourse(groupId, token);

    return {
      groupId,
      courseCode: groupInfo.course.course.code || "N/A",
      groupName: "Grupo",
    };
  } catch (error) {
    console.error("Error loading group info:", error);
    return {
      groupId,
      courseCode: "N/A",
      groupName: "Grupo",
    };
  }
};
