import type { LayoutServerLoad } from './$types';

import { redirect } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
import { PUBLIC_API_URL } from '$env/static/public';
import jwt from 'jsonwebtoken';
import type { UserProfileDTO, JwtPayload } from '$lib/dto/user.dto';

export const load: LayoutServerLoad = async ({ cookies, url, fetch }) => {
  let token = cookies.get('jwt_token');
  let userProfile: UserProfileDTO | null = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      const profileResponse = await fetch(`${PUBLIC_API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (profileResponse.ok) {
        userProfile = (await profileResponse.json()) as UserProfileDTO;
        userProfile.iconURL = decoded.pictureURL;
        console.log('Fetched user profile:', userProfile);
      } else {
        console.error(
          `Failed to fetch profile in layout: ${profileResponse.status}`,
        );
        cookies.delete('jwt_token', { path: '/' });
        token = undefined;
        userProfile = null;
      }
    } catch (error) {
      console.error('JWT verification failed in layout:', error);
      cookies.delete('jwt_token', { path: '/' });
      token = undefined;
      userProfile = null;
    }
  }

  const isOnLoginPage = url.pathname === '/login';
  const isOnProtectedRoute = !isOnLoginPage;

  if (!token && isOnProtectedRoute) {
    console.log('Redirecting to login from protected route:', url.pathname);
    throw redirect(303, `/login?redirectTo=${url.pathname}`);
  }

  if (token && isOnLoginPage) {
    console.log('Redirecting logged-in user from login page to /home');
    throw redirect(303, '/home');
  }

  return {
    userProfile: userProfile,
  };
};
