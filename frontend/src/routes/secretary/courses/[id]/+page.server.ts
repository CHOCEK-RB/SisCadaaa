import { academicCourseService } from "$lib/services/academic_course.service";
import type { AcademicCourseDTO } from "$lib/types/course.types";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params }) => {
  try {
    const course: AcademicCourseDTO = await academicCourseService.getCourse(
      params.id,
      { fetch },
    );
    console.log("✅ [server] Fetched course:", course.course.name);

    return {
      course,
    };
  } catch (error) {
    console.error(
      `❌ [server] Error loading data for course ${params.id}:`,
      error,
    );
    return {
      course: null,
      error: "Failed to load course data from the server.",
    };
  }
};
