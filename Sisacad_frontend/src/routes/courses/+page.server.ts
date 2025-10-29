import { PUBLIC_API_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { GroupedEnrollments } from '$lib/dto/user.dto';

export const load: PageServerLoad = async ({ locals, fetch, cookies }) => {
  if (!locals.user) {
    throw redirect(303, '/login?redirectTo=/courses');
  }
  if (locals.user.role !== 'student') {
    throw redirect(303, '/home');
  }

  const token = cookies.get('jwt_token');
  if (!token) {
    throw redirect(303, '/login?redirectTo=/courses');
  }

  try {
    const response = await fetch(`${PUBLIC_API_URL}/enrollments/my-courses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        cookies.delete('jwt_token', { path: '/' });
        throw redirect(303, '/login?redirectTo=/courses');
      }
      const errorData = await response.json();
      throw new Error(
        `Failed to fetch courses: ${errorData.message || response.statusText}`,
      );
    }

    const groupedEnrollments: GroupedEnrollments = await response.json();

    return {
      groupedEnrollments,
    };
  } catch (err) {
    console.error('Error loading courses page:', err);
    throw redirect(303, '/home');
  }
};
