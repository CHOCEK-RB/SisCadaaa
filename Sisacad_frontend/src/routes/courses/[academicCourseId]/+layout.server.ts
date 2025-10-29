import { PUBLIC_API_URL } from '$env/static/public';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { AcademicCourseDTO } from '$lib/dto/user.dto';

export const load: LayoutServerLoad = async ({
  locals,
  fetch,
  params,
  cookies,
}) => {
  const user = locals.user;
  if (!user) {
    throw redirect(
      303,
      `/login?redirectTo=/courses/${params.academicCourseId}`,
    );
  }

  const token = cookies.get('jwt_token');
  if (!token) {
    throw redirect(
      303,
      `/login?redirectTo=/courses/${params.academicCourseId}`,
    );
  }

  const academicCourseId = params.academicCourseId;

  try {
    const response = await fetch(
      `${PUBLIC_API_URL}/academic-courses/${academicCourseId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw error(404, 'Curso no encontrado');
      }
      if (response.status === 401 || response.status === 403) {
        cookies.delete('jwt_token', { path: '/' });
        throw redirect(
          303,
          `/login?redirectTo=/courses/${params.academicCourseId}`,
        );
      }
      const errorData = await response.json().catch(() => ({}));
      throw error(
        response.status,
        `Error al cargar detalles del curso: ${errorData.message || response.statusText}`,
      );
    }

    const courseDetails: AcademicCourseDTO = await response.json();

    return {
      userRole: user.role,
      courseDetails: courseDetails,
    };
  } catch (err) {
    console.error('Error loading course layout:', err);
  }
};
