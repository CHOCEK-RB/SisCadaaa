import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { EnrollmentDetailDTO } from '$lib/types/enrollment.types';

import { enrollmentService } from '$lib/services/enrollment.service';

export interface GroupedEnrollments {
  [period: string]: EnrollmentDetailDTO[];
}

export const load: PageServerLoad = async ({ locals, cookies }) => {
  if (locals.user.role !== 'student') {
    throw redirect(303, '/');
  }

  const token = cookies.get('jwt_token');

  if (!token) {
    throw redirect(303, '/login?redirectTo=/student/courses');
  }

  try {
    const response = await enrollmentService.getEnrollments(token);

    const groupedEnrollments: GroupedEnrollments =
      response as GroupedEnrollments;

    return {
      groupedEnrollments,
    };
  } catch (err) {
    console.error('Error loading courses page:', err);
    throw redirect(303, '/');
  }
};
