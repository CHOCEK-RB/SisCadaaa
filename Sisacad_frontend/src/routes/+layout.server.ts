import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const user = locals.user;

  if (url.pathname === '/' && !user) {
    throw redirect(303, '/login');
  }

  if (url.pathname === '/' && user) {
    throw redirect(303, '/dashboard');
  }

  return { user };
};
