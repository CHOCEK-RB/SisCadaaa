import { api } from './api.service';
import type { Grades } from '$lib/types/enrollment.types';

export const enrollmentService = {
  async getEnrollments(token: string) {
    const response = await api.get('/enrollments/my-courses', { token: token });

    if (!response) {
      throw new Error('No se recibieron datos del servidor, inscripciones');
    }

    return response;
  },

  async getGradeById(academicCourseId: string, token: string) {
    const response = await api.get<Grades>(
      `/enrollments/my-grades/${academicCourseId}`,
      {
        token: token,
      },
    );

    if (!response) {
      throw new Error('No se recibieron datos del servidor, calificaciones');
    }

    return response;
  },
};
