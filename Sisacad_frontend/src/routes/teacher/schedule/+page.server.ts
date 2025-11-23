import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { groupsService } from '$lib/services/groups.service';

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (locals.user?.role !== 'teacher') {
    throw redirect(303, '/');
  }

  try {
    const allScheduleGroups = await groupsService.getTeacherSchedule(fetch);

    return {
      allScheduleGroups,
    };
  } catch (err) {
    console.error('Error loading teacher schedule page:', err);

    return {
      allScheduleGroups: [],
      error: 'Error al cargar tu horario completo. Intenta de nuevo más tarde.',
    };
  }
};