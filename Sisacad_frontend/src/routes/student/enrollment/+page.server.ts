import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { enrollmentService } from "$lib/services/enrollment.service";
import type { AcademicCourseDTO } from "$lib/types/course.types";

type LoadReturn = {
  availableCourses: AcademicCourseDTO[] | null;
  isPeriodActive: boolean;
  error?: string;
};

export const load: PageServerLoad = async ({
  locals,
  cookies,
}): Promise<LoadReturn> => {
  if (locals.user?.role !== "student") {
    throw redirect(303, "/");
  }

  const token = cookies.get("jwt_token");
  if (!token) {
    throw redirect(303, "/login?redirectTo=/student/enrollment");
  }

  try {
    const status = await enrollmentService.getLabEnrollmentStatus(token);
    if (!status.isActive) {
      return {
        availableCourses: [],
        isPeriodActive: false,
        error: "El período de matrícula de laboratorios no está activo.",
      };
    }

    const courses = await enrollmentService.getAvailableLabGroups(token);

    console.log("Available courses", courses);

    return {
      availableCourses: courses,
      isPeriodActive: true,
    };
  } catch (err: any) {
    console.error("Error loading enrollment page:", err);
    return {
      availableCourses: null,
      isPeriodActive: false,
      error:
        "No se pudo cargar la información de matrícula. " +
        (err.message || "Inténtalo de nuevo más tarde."),
    };
  }
};
