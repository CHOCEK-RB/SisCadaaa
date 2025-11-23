import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { groupsService } from '$lib/services/groups.service';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
  if (locals.user?.role !== 'teacher') {
    throw redirect(303, '/');
  }

  const { academicCourseId } = params;

  try {
    const scheduleGroups = await groupsService.getScheduleForGroup(
      academicCourseId,
      fetch,
    );

    return {
      scheduleGroups,
    };
  } catch (err) {
    console.error('Error loading course schedule page:', err);

    return {
      scheduleGroups: [],
      error:
        'Error al cargar el horario del curso. Intenta de nuevo más tarde.',
    };
  }
};