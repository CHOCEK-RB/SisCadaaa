import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { groupsService } from '$lib/services/groups.service';

export const load: PageServerLoad = async ({ locals, params, fetch }) => {
  if (locals.user?.role !== 'teacher') {
    throw redirect(303, '/');
  }

  const { academicCourseId } = params;

  try {
    const groupGrades = await groupsService.getGroupGrades(
      academicCourseId,
      fetch,
    );

    return {
      groupGrades,
    };
  } catch (err) {
    console.error('Error loading group grades for attendance:', err);

    return {
      groupGrades: null,
      error:
        'Error de red al cargar las notas del grupo. Intenta de nuevo más tarde.',
    };
  }
};