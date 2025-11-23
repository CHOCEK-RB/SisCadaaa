import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { academicCourseService } from '$lib/services/academic_course.service';

export const load: LayoutServerLoad = async ({ locals, params, fetch }) => {
  if (locals.user?.role !== 'teacher') {
    throw redirect(303, '/');
  }

  const { academicCourseId } = params;

  try {
    const courseDetails = await academicCourseService.getCourse(
      academicCourseId,
      fetch,
    );

    return {
      courseDetails,
    };
  } catch (err) {
    console.error('Error loading course layout:', err);
    return {
      courseDetails: null,
      error: 'Failed to load course details',
    };
  }
};