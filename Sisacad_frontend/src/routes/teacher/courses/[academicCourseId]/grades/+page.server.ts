import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (locals.user?.role !== 'teacher') {
    throw redirect(303, '/');
  }

  const groupId = params.academicCourseId;

  return {
    groupId,
  };
};