import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { enrollmentService } from '$lib/services/enrollment.service';

import type { Grades } from '$lib/types/enrollment.types';

type LoadReturn =
  | { grades: Grades | null; error?: null }
  | { grades?: null; error: string };

export const load: PageServerLoad = async ({
  locals,
  params,
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
    const response = await enrollmentService.getGradeById(
      academicCourseId,
      token,
    );

    const grades: Grades = response;

    return { grades };
  } catch (err) {
    console.error('Error loading grades page:', err);
    return {
      error:
        'Error de conexión: No se pudo cargar la información. Intenta de nuevo más tarde.',
    };
  }
};
