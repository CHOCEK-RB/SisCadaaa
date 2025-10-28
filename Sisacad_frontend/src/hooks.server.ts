import { redirect, type Handle } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
import { verifyToken } from '$lib/utils/auth';
import type { UserSession } from '$lib/store/auth.store';

const protectedRoutes = ['/dashboard'];

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('jwt_token');
  let user: UserSession | null = null;

  if (token) {
    try {
      user = await verifyToken(token, JWT_SECRET);
      event.locals.user = user;
    } catch (error) {
      console.error('Invalid token:', error);
      event.locals.user = null;
      event.cookies.delete('jwt_token', { path: '/' });
    }
  } else {
    event.locals.user = null;
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    event.url.pathname.startsWith(route),
  );

  if (isProtectedRoute && !event.locals.user) {
    console.log(
      `Redirecting unauthorized access from ${event.url.pathname} to /login`,
    );
    throw redirect(
      303,
      `/login?redirectTo=${encodeURIComponent(event.url.pathname + event.url.search)}`,
    );
  }

  if (event.url.pathname === '/login' && event.locals.user) {
    console.log(`Redirecting logged-in user from /login to /dashboard`);
    throw redirect(303, '/dashboard');
  }

  const response = await resolve(event);
  return response;
};
