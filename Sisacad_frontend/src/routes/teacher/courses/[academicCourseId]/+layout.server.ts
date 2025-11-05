import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import type { AcademicCourseDTO } from "$lib/types/course.types";

import { academicCourseService } from "$lib/services/academic_course.service";

export const load: LayoutServerLoad = async ({ locals, params, cookies }) => {
  if (locals.user.role !== "teacher") {
    throw redirect(303, "/");
  }

  const token = cookies.get("jwt_token");

  if (!token) {
    throw redirect(303, "/login?redirectTo=/teacher/courses");
  }

  const academicCourseId = params.academicCourseId;

  try {
    const response = await academicCourseService.getCourseByGroup(
      academicCourseId,
      token,
    );

    const courseDetails: AcademicCourseDTO = response;

    return {
      courseDetails: courseDetails,
    };
  } catch (err) {
    console.error("Error loading course layout:", err);
  }
};
