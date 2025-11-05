import { api } from "./api.service";
import type { AcademicCourseDTO } from "$lib/types/course.types";

export const academicCourseService = {
  async getCourse(id: string, token: string) {
    const response = await api.get<AcademicCourseDTO>(
      `/academic-courses/${id}`,
      { token: token },
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, cursos");
    }

    return response;
  },

  async getCourseByGroup(id: string, token: string) {
    const response = await api.get<AcademicCourseDTO>(`/groups/course/${id}`, {
      token: token,
    });

    if (!response) {
      throw new Error("No se recibieron datos del servidor, cursos");
    }

    return response;
  },
};
