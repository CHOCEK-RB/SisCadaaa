import { api, type RequestOptions } from "./api.service";
import type { Grades, GradesAndSchemeDTO } from "$lib/types/enrollment.types";
import type { AcademicGroupDTO } from "$lib/types/group.types";
import type { AcademicCourseDTO } from "$lib/types/course.types";
import type { GradingScheme } from "$lib/types/course.types";

export interface GradesAndPercent {
  course: AcademicCourseDTO;
  grades: Grades;
  percent: GradingScheme;
}

export interface EnrollLabGroupPayload {
  labGroupIds: string[];
}

export const enrollmentService = {
  async getEnrollments(options: RequestOptions = {}) {
    const response = await api.get("/enrollments/my-courses", options);

    if (!response) {
      throw new Error("No se recibieron datos del servidor, inscripciones");
    }

    return response;
  },

  async getGradeById(academicCourseId: string, options: RequestOptions = {}) {
    const response = await api.get<GradesAndSchemeDTO>(
      `/enrollments/my-grades/${academicCourseId}`,
      options,
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, calificaciones");
    }

    return response;
  },

  async getScheduleForCourse(
    academicCourseId: string,
    options: RequestOptions = {},
  ) {
    const response = await api.get<AcademicGroupDTO[]>(
      `/enrollments/my-schedule/${academicCourseId}`,
      options,
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, horario del curso");
    }

    return response;
  },

  async getMySchedule(options: RequestOptions = {}) {
    const response = await api.get<AcademicGroupDTO[]>(
      `/enrollments/my-schedule`,
      options,
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, horario completo");
    }

    return response;
  },

  async getAllMyGrades(options: RequestOptions = {}) {
    const response = await api.get<GradesAndPercent[]>(
      "/enrollments/my-grades",
      options,
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, calificaciones");
    }

    return response;
  },

  async getAvailableLabGroups(
    options: RequestOptions = {},
  ): Promise<AcademicCourseDTO[] | null> {
    const response = await api.get<AcademicCourseDTO[]>(
      "/enrollments/available-labs",
      options,
    );
    return response;
  },

  async enrollInLabGroups(
    labGroupIds: string[],
    options: RequestOptions = {},
  ): Promise<any> {
    const payload: EnrollLabGroupPayload = { labGroupIds };

    const response = await api.post<any>(
      "/student/enrollments/enroll-labs",
      payload,
      options,
    );

    if (!response) {
      throw new Error("No se recibió respuesta del servidor al matricular.");
    }

    return response;
  },

  async getLabEnrollmentStatus(
    options: RequestOptions = {},
  ): Promise<{ isActive: boolean }> {
    try {
      const response = await api.get<{ isActive: boolean }>(
        "/events/status/lab_enrollment",
        options,
      );
      return response || { isActive: false };
    } catch (error) {
      console.error("Error fetching enrollment status:", error);
      return { isActive: false }; // Por seguridad, si falla, se asume cerrado.
    }
  },
};
