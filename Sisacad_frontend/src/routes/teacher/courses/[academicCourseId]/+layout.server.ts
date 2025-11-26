import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { groupsService } from "$lib/services/groups.service";
import { academicCourseService } from "$lib/services/academic_course.service";

export const load: LayoutServerLoad = async ({ locals, params, fetch }) => {
  if (locals.user?.role !== "teacher") {
    throw redirect(303, "/");
  }

  const academicGroupId = params.academicCourseId;

  try {
    const academicGroup = await groupsService.getAcademicCourse(
      academicGroupId,
      {
        fetch,
      },
    );

    if (!academicGroup || !academicGroup.course) {
      throw new Error("Academic Group or associated course not found.");
    }

    const courseDetails = await academicCourseService.getCourse(
      academicGroup.course.id,
      {
        fetch,
      },
    );

    return {
      courseDetails,
      academicGroupId, // Make the academicGroupId available to nested layouts/pages
    };
  } catch (err) {
    console.error("Error loading course layout:", err);
    throw redirect(303, "/teacher/courses"); // Redirect to the courses list on error
  }
};
