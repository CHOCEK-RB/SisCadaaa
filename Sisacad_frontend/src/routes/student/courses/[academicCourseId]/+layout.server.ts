import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { academicCourseService } from "$lib/services/academic_course.service";

export const load: LayoutServerLoad = async ({ locals, params, fetch }) => {
  if (locals.user?.role !== "student") {
    throw redirect(303, "/");
  }

  const { academicCourseId } = params;

  try {
    const courseDetails = await academicCourseService.getCourse(
      academicCourseId,
      { fetch },
    );

    console.log(
      "Topics received in layout.server.ts:",
      JSON.stringify(courseDetails?.topics, null, 2),
    );

    return {
      courseDetails,
    };
  } catch (err) {
    console.error("Error loading course layout:", err);
    return { courseDetails: null, error: "Failed to load course details" };
  }
};

