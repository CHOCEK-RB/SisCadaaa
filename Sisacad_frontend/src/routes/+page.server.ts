import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    if (locals.user.role === 'student') {
      throw redirect(303, '/student');
    }
  } else {
    throw redirect(303, '/login');
  }
};
