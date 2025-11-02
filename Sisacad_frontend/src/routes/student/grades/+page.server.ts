import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import {
  enrollmentService,
  type GradesAndPercent,
} from '$lib/services/enrollment.service';

type LoadReturn =
  | {
      allGrades: GradesAndPercent[];
      error?: null;
    }
  | {
      allGrades?: null;
      error: string;
    };

export const load: PageServerLoad = async ({
  locals,
  cookies,
}): Promise<LoadReturn> => {
  if (locals.user.role !== 'student') {
    throw redirect(303, '/');
  }

  const token = cookies.get('jwt_token');

  if (!token) {
    throw redirect(303, '/login?redirectTo=/student/grades');
  }

  try {
    const response = await enrollmentService.getAllMyGrades(token);

    const allGrades: GradesAndPercent[] = response;

    return {
      allGrades,
    };
  } catch (err) {
    console.error('Error loading student grades page:', err);

    return {
      error: 'Error al cargar tus calificaciones. Intenta de nuevo más tarde.',
    };
  }
};
