import { api } from "./api.service";
import type { AcademicGroupDTO } from "$lib/types/group.types";

export interface GroupsForPeriods {
  [period: string]: AcademicGroupDTO[];
}

export interface StudentGradeInfo {
  enrollmentId: string;
  studentId: string;
  cui: string;
  firstName: string;
  lastName: string;
  grades: {
    firstContinue: number;
    secondContinue: number;
    thirdContinue: number;
    firstPartial: number;
    secondPartial: number;
    thirdPartial: number;
  };
}

export interface GroupGradesResponse {
  groupId: string;
  groupName: string;
  groupType: string;
  courseName: string;
  courseCode: string;
  canEdit: boolean;
  students: StudentGradeInfo[];
  gradingScheme: {
    firstContinue: number;
    secondContinue: number;
    thirdContinue: number;
    firstPartial: number;
    secondPartial: number;
    thirdPartial: number;
  };
}

export interface UpdateGradeDto {
  enrollmentId: string;
  grades: Partial<{
    firstContinue: number;
    secondContinue: number;
    thirdContinue: number;
    firstPartial: number;
    secondPartial: number;
    thirdPartial: number;
  }>;
}

export const groupsService = {
  async getGroups(fetcher?: typeof fetch): Promise<GroupsForPeriods> {
    const response = await api.get<GroupsForPeriods>("/groups/teacher", {
      fetch: fetcher,
    });

    if (!response) {
      throw new Error("No se recibieron datos del servidor, grupos");
    }

    return response;
  },

  async getScheduleForGroup(groupID: string, fetcher?: typeof fetch) {
    const response = await api.get<AcademicGroupDTO[]>(
      `/groups/schedule/${groupID}`,
      {
        fetch: fetcher,
      },
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, horario del grupo");
    }

    return response;
  },

  async getGroupGrades(
    groupId: string,
    fetcher?: typeof fetch,
  ): Promise<GroupGradesResponse> {
    const response = await api.get<GroupGradesResponse>(
      `/groups/${groupId}/grades`,
      { fetch: fetcher },
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, notas del grupo");
    }

    return response;
  },

  async updateStudentGrade(
    groupId: string,
    updateDto: UpdateGradeDto,
    token: string,
  ): Promise<void> {
    await api.patch(`/groups/${groupId}/grades`, updateDto, { token });
  },

  async updateMultipleGrades(
    groupId: string,
    updates: UpdateGradeDto[],
    token: string,
  ): Promise<void> {
    await api.patch(`/groups/${groupId}/grades/bulk`, { updates }, { token });
  },

  async getAcademicCourse(id: string, fetcher?: typeof fetch) {
    const response = await api.get<AcademicGroupDTO>(`/groups/course/${id}`, {
      fetch: fetcher,
    });

    if (!response) {
      throw new Error("No se recibieron datos del servidor, cursos");
    }

    return response;
  },

  async getTeacherSchedule(
    fetcher?: typeof fetch,
  ): Promise<AcademicGroupDTO[]> {
    const response = await api.get<AcademicGroupDTO[]>(
      '/groups/teacher/my-schedule',
      {
        fetch: fetcher,
      },
    );

    if (!response) {
      throw new Error(
        "No se recibieron datos del servidor, horario del profesor",
      );
    }

    return response;
  },
};
