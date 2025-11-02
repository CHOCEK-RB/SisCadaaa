import { api } from './api.service';
import type { Grades } from '$lib/types/enrollment.types';
import type { AcademicGroupDTO } from '$lib/types/group.types';
import type { AcademicCourseDTO } from '$lib/types/course.types';
import type { GradingScheme } from '$lib/types/course.types';

export interface GradesAndPercent {
  course: AcademicCourseDTO;
  grades: Grades;
  percent: GradingScheme;
}

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

  async getScheduleForCourse(academicCourseId: string, token: string) {
    const response = await api.get<AcademicGroupDTO[]>(
      `/enrollments/my-schedule/${academicCourseId}`,
      {
        token: token,
      },
    );

    if (!response) {
      throw new Error('No se recibieron datos del servidor, horario del curso');
    }

    return response;
  },

  async getMySchedule(token: string) {
    const response = await api.get<AcademicGroupDTO[]>(
      `/enrollments/my-schedule`,
      {
        token: token,
      },
    );

    if (!response) {
      throw new Error('No se recibieron datos del servidor, horario completo');
    }

    return response;
  },

  async getAllMyGrades(token: string) {
    const response = await api.get<GradesAndPercent[]>(
      '/enrollments/my-grades',
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
