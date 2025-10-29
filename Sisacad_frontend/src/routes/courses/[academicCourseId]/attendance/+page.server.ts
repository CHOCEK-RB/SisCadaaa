import { PUBLIC_API_URL } from '$env/static/public';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../../$types';
import type { StudentCourseAttendanceDTO } from '$lib/dto/user.dto';

type LoadReturn =
  | { attendanceData: StudentCourseAttendanceDTO; error?: null }
  | { attendanceData?: null; error: string };

export const load: PageServerLoad = async ({
  locals,
  fetch,
  params,
  cookies,
  parent,
}): Promise<LoadReturn> => {
  const { userRole } = await parent();

  const user = locals.user;
  if (!user) {
    throw redirect(
      303,
      `/login?redirectTo=/courses/${params.academicCourseId}`,
    );
  }

  if (userRole !== 'student' || user.role !== 'student') {
    throw error(
      403,
      'Forbidden: Solo los estudiantes pueden ver su asistencia.',
    );
  }

  const token = cookies.get('jwt_token');
  if (!token) {
    throw redirect(
      303,
      `/login?redirectTo=/courses/${params.academicCourseId}/attendance`,
    );
  }

  const academicCourseId = params.academicCourseId;

  try {
    const response = await fetch(
      `${PUBLIC_API_URL}/attendances/my-attendance/${academicCourseId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          error: 'Matrícula o asistencias no encontradas para este curso.',
        };
      }
      if (response.status === 401 || response.status === 403) {
        cookies.delete('jwt_token', { path: '/' });
        throw redirect(
          303,
          `/login?redirectTo=/courses/${params.academicCourseId}/attendance`,
        );
      }
      const errorData = await response.json().catch(() => ({
        message: `Error ${response.status}: ${response.statusText}`,
      }));
      return { error: `Error al cargar asistencia: ${errorData.message}` };
    }

    const attendanceData: StudentCourseAttendanceDTO = await response.json();

    return {
      attendanceData,
    };
  } catch (err) {
    console.error('Error loading attendance page:', err);

    return { error: 'Error de red al cargar la asistencia. Intenta de nuevo.' };
  }
};
