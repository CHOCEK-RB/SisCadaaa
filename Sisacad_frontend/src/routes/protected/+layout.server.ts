import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  const token = cookies.get('jwt_token');

  if (!token) {
    throw redirect(303, `/login?redirectTo=${url.pathname}`);
  }

  return {};
};
