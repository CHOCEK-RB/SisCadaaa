import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { AcademicGroupDTO } from "$lib/types/group.types";

import { enrollmentService } from "$lib/services/enrollment.service";

type LoadReturn =
  | { allScheduleGroups: AcademicGroupDTO[]; error?: null }
  | { allScheduleGroups?: null; error: string };

export const load: PageServerLoad = async ({
  locals,
  cookies,
}): Promise<LoadReturn> => {
  if (locals.user.role !== "student") {
    throw redirect(303, "/");
  }

  const token = cookies.get("jwt_token");

  if (!token) {
    throw redirect(303, "/login?redirectTo=/student/schedule");
  }

  try {
    const response = await enrollmentService.getMySchedule(token);

    const allScheduleGroups: AcademicGroupDTO[] = response;

    console.log(allScheduleGroups);

    return {
      allScheduleGroups,
    };
  } catch (err) {
    console.error("Error loading student schedule page:", err);

    return {
      error: "Error al cargar tu horario completo. Intenta de nuevo más tarde.",
    };
  }
};
