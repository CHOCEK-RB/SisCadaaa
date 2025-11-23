import { api } from "./api.service";
import type { Grades } from "$lib/types/enrollment.types";
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
  async getEnrollments(fetcher?: typeof fetch) {
    const response = await api.get("/enrollments/my-courses", {
      fetch: fetcher,
    });

    if (!response) {
      throw new Error("No se recibieron datos del servidor, inscripciones");
    }

    return response;
  },

  async getGradeById(academicCourseId: string, fetcher?: typeof fetch) {
    const response = await api.get<Grades>(
      `/enrollments/my-grades/${academicCourseId}`,
      {
        fetch: fetcher,
      },
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, calificaciones");
    }

    return response;
  },

  async getScheduleForCourse(academicCourseId: string, fetcher?: typeof fetch) {
    const response = await api.get<AcademicGroupDTO[]>(
      `/enrollments/my-schedule/${academicCourseId}`,
      {
        fetch: fetcher,
      },
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, horario del curso");
    }

    return response;
  },

  async getMySchedule(fetcher?: typeof fetch) {
    const response = await api.get<AcademicGroupDTO[]>(
      `/enrollments/my-schedule`,
      {
        fetch: fetcher,
      },
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, horario completo");
    }

    return response;
  },

  async getAllMyGrades(fetcher?: typeof fetch) {
    const response = await api.get<GradesAndPercent[]>(
      '/enrollments/my-grades',
      { fetch: fetcher },
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, calificaciones");
    }

    return response;
  },

  async getAvailableLabGroups(
    fetcher?: typeof fetch,
  ): Promise<AcademicCourseDTO[] | null> {
    const response = await api.get<AcademicCourseDTO[]>(
      '/enrollments/available-labs',
      {
        fetch: fetcher,
      },
    );
    return response;
  },

  async enrollInLabGroups(
    labGroupIds: string[],
    fetcher?: typeof fetch,
  ): Promise<any> {
    const payload: EnrollLabGroupPayload = { labGroupIds };

    const response = await api.post<any>('/student/enrollments/enroll-labs', payload, {
      fetch: fetcher,
    });

    if (!response) {
      throw new Error("No se recibió respuesta del servidor al matricular.");
    }

    return response;
  },

  async getLabEnrollmentStatus(
    fetcher?: typeof fetch,
  ): Promise<{ isActive: boolean }> {
    try {
      const response = await api.get<{ isActive: boolean }>(
        '/events/status/lab_enrollment',
        { fetch: fetcher },
      );
      return response || { isActive: false };
    } catch (error) {
      console.error('Error fetching enrollment status:', error);
      return { isActive: false }; // Por seguridad, si falla, se asume cerrado.
    }
  },
};
