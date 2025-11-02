import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { AcademicGroupDTO } from '$lib/types/group.types';

import { enrollmentService } from '$lib/services/enrollment.service';

type LoadReturn =
  | { scheduleGroups: AcademicGroupDTO[]; error?: null }
  | { scheduleGroups?: null; error: string };

export const load: PageServerLoad = async ({
  params,
  locals,
  cookies,
}): Promise<LoadReturn> => {
  if (locals.user.role !== 'student') {
    throw redirect(303, '/');
  }

  const token = cookies.get('jwt_token');

  if (!token) {
    throw redirect(303, '/login?redirectTo=/student/courses');
  }

  const academicCourseId = params.academicCourseId;

  try {
    const response = await enrollmentService.getScheduleForCourse(
      academicCourseId,
      token,
    );

    const scheduleGroups: AcademicGroupDTO[] = response;

    console.log(scheduleGroups);

    return {
      scheduleGroups,
    };
  } catch (err) {
    console.error('Error loading course schedule page:', err);

    return {
      error:
        'Error al cargar el horario del curso. Intenta de nuevo más tarde.',
    };
  }
};
