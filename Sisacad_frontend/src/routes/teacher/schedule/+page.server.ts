import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { AcademicGroupDTO } from "$lib/types/group.types";

import { groupsService } from "$lib/services/groups.service";

type LoadReturn =
  | { allScheduleGroups: AcademicGroupDTO[]; error?: null }
  | { allScheduleGroups?: null; error: string };

export const load: PageServerLoad = async ({
  locals,
  cookies,
}): Promise<LoadReturn> => {
  if (locals.user?.role !== "teacher") {
    throw redirect(303, "/");
  }

  const token = cookies.get("jwt_token");

  if (!token) {
    throw redirect(303, "/login?redirectTo=/teacher/schedule");
  }

  try {
    const response = await groupsService.getTeacherSchedule(token);

    const allScheduleGroups: AcademicGroupDTO[] = response || [];

    return {
      allScheduleGroups,
    };
  } catch (err: any) {
    console.error("Error loading teacher schedule page:", err);

    return {
      error: "Error al cargar tu horario completo. Intenta de nuevo más tarde.",
    };
  }
};
