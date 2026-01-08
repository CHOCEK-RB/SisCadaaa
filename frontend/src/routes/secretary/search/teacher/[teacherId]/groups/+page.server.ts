import { groupsService } from "$lib/services/groups.service";
import { userService } from "$lib/services/user.service";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { teacherId } = params;
  try {
    const [teacherProfile, groups] = await Promise.all([
      userService.getTeacherById(teacherId, { fetch }),
      groupsService.getTeacherGroupsHistory(teacherId, { fetch })
    ]);

    return { teacherProfile, groups };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return { teacherProfile: null, groups: [] };
  }
};