import { error, redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { groupsService } from "$lib/services/groups.service";
import type { AcademicGroupDTO } from "$lib/types/group.types";

export const load: LayoutServerLoad = async ({ fetch, params, locals }) => {
  if (locals.user?.role !== "secretary") {
    throw redirect(303, "/");
  }

  const { id } = params;

  try {
    const groupInfo: AcademicGroupDTO = await groupsService.getGroupDetails(
      id,
      { fetch },
    );

    console.log(groupInfo);

    if (!groupInfo) {
      throw error(404, "Group not found");
    }

    return {
      groupInfo,
    };
  } catch (e: any) {
    console.error("Error loading group layout data:", e);
    throw error(
      e.status || 500,
      e.body?.message || "Could not load group data",
    );
  }
};
