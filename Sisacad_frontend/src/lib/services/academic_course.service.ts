import { api } from './api.service';
import type { AcademicCourseDTO } from '$lib/dto/user.dto';

export const academicCourseService = {
  async getCourse(id: string, token: string) {
    const response = await api.get<AcademicCourseDTO>(
      `/academic-courses/${id}`,
      { token: token },
    );

    if (!response) {
      throw new Error('No se recibieron datos del servidor, cursos');
    }

    return response;
  },
};
