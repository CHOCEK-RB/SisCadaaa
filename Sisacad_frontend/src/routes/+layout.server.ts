import type { LayoutServerLoad } from "./$types";
import { userService } from "$lib/services/user.service";

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
  const user = locals.user;

  if (!user) {
    return { user: null, profile: null };
  }

  try {
    const profile = await userService.getProfile(fetch);
    if (profile) {
      profile.iconURL = user.pictureURL;
    }
    console.log("Profile fetched via service:", profile);
    return {
      user,
      profile,
    };
  } catch (error) {
    console.error("Error fetching profile via service:", error);
    return {
      user,
      profile: null,
    };
  }
};

