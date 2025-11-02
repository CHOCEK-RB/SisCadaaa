import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { GroupAttendanceDTO } from '$lib/types/attendance.types';

import { attendanceService } from '$lib/services/attendance.service';

type LoadReturn =
  | { attendanceData: GroupAttendanceDTO[]; error?: null }
  | { attendanceData?: null; error: string };

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
    const response = await attendanceService.getGroupAttendance(
      academicCourseId,
      token,
    );

    const attendanceData: GroupAttendanceDTO[] = response;

    return {
      attendanceData,
    };
  } catch (err) {
    console.error('Error loading attendance page:', err);

    return { error: 'Error de red al cargar la asistencia. Intenta de nuevo.' };
  }
};
