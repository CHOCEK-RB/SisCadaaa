import type { LayoutServerLoad } from './$types';
import { userService } from '$lib/services/user.service';
import type { UserProfileDTO } from '$lib/types/auth.types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  const user = locals.user;

  if (!user) {
    return { user: null, profile: null };
  }

  let profile: UserProfileDTO | null = null;

  try {
    const token = cookies.get('jwt_token');

    if (token) {
      const profileResponse = await userService.getProfile(token);

      console.log('Profile response:', profileResponse);

      if (profileResponse) {
        profile = profileResponse as UserProfileDTO;
        profile!.iconURL = user.pictureURL;
      } else {
        console.error(`Failed to fetch profile: ${profileResponse}`);
      }
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  }

  console.log('Profile:', profile, user);

  return {
    user,
    profile,
  };
};
