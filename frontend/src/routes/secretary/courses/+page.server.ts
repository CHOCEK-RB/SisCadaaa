import { academicCourseService } from "$lib/services/academic_course.service";
import type { PageServerLoad } from "./$types";

import type { AcademicCourseDTO } from "$lib/types/course.types";

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const periods = await academicCourseService.getAcademicPeriods({ fetch });
    console.log(
      "✅ [server] Fetched periods:",
      periods.map((p) => p.name),
    );

    // Sort periods by start date, newest first
    periods.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );

    let courses: AcademicCourseDTO[] = [];
    let selectedPeriodId = undefined;

    if (periods.length > 0) {
      selectedPeriodId = periods[0].id;
      console.log(
        "ℹ️ [server] Most recent period ID selected:",
        selectedPeriodId,
      );

      courses = await academicCourseService.getCoursesByPeriod(
        selectedPeriodId,
        { fetch },
      );
      console.log(
        `ℹ️ [server] Fetched ${courses.length} courses for period ${selectedPeriodId}.`,
      );
    } else {
      console.warn("⚠️ [server] No academic periods found.");
    }

    return {
      periods,
      courses,
      selectedPeriodId,
    };
  } catch (error) {
    console.error(
      "❌ [server] Error loading data for secretary courses page:",
      error,
    );
    return {
      periods: [],
      courses: [],
      selectedPeriodId: null,
      error: "Failed to load data from the server.",
    };
  }
};
