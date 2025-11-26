import { api } from "./api.service";
import type { AcademicCourseDTO } from "$lib/types/course.types";
import type { RequestOptions } from "./api.service";

export const academicCourseService = {
  async getCourse(id: string, options: RequestOptions = {}) {
    const response = await api.get<AcademicCourseDTO>(
      `/academic-courses/${id}`,
      options,
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, cursos");
    }

    return response;
  },

  async getCourseByGroup(id: string, options: RequestOptions = {}) {
    const response = await api.get<AcademicCourseDTO>(
      `/groups/course/${id}`,
      options,
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, cursos");
    }

    return response;
  },
};
