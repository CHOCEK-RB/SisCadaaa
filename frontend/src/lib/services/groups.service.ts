import { api, type RequestOptions } from "./api.service";
import type { AcademicGroupDTO } from "$lib/types/group.types";
import type { StudentUserDTO, TeacherDTO } from "$lib/types/user.types"; // Import TeacherDTO
import { AcademicGroupType } from "$lib/types/group.types"; // Import AcademicGroupType

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

// New interface for creating an academic group
export interface CreateAcademicGroupPayload {
  name: string;
  capacity: number;
  type: string; // Corresponds to GroupType enum string
  academicCourseId: string;
  teacherId?: string;
}

export interface CreateScheduleSlotPayload {
  day: string; // Should be DayOfWeek enum string
  startTime: string;
  endTime: string;
}

export interface CreateSchedulePayload {
  groupId: string;
  classroomId: string;
  scheduleSlots: CreateScheduleSlotPayload[];
}

// New interface for updating an academic group
export interface UpdateAcademicGroupPayload {
  name?: string;
  capacity?: number;
  teacherId?: string | null;
  type?: AcademicGroupType;
}


export const groupsService = {
  async createAcademicGroup(
    payload: CreateAcademicGroupPayload,
    options: RequestOptions = {},
  ): Promise<AcademicGroupDTO> {
    const response = await api.post<AcademicGroupDTO>(`/groups`, payload, options);
    if (!response) {
      throw new Error("No se recibieron datos del servidor al crear el grupo académico");
    }
    return response;
  },

  async createSchedule(
    payload: CreateSchedulePayload,
    options: RequestOptions = {},
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/groups/schedule`, payload, options);
    if (!response) {
      throw new Error("No se recibieron datos del servidor al crear el horario.");
    }
    return response;
  },

  async getGroupDetails(
    id: string,
    options: RequestOptions = {},
  ): Promise<AcademicGroupDTO> {
    const response = await api.get<AcademicGroupDTO>(
      `/groups/${id}/details`,
      options,
    );
    if (!response) {
      throw new Error(
        "No se recibieron datos del servidor para los detalles del grupo",
      );
    }
    return response;
  },

  async getGroups(options: RequestOptions = {}): Promise<GroupsForPeriods> {
    const response = await api.get<GroupsForPeriods>(
      "/groups/teacher",
      options,
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, grupos");
    }

    return response;
  },

  async getScheduleForGroup(groupID: string, options: RequestOptions = {}) {
    const response = await api.get<AcademicGroupDTO[]>(
      `/groups/schedule/${groupID}`,
      options,
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, horario del grupo");
    }

    return response;
  },

  async getGroupGrades(
    groupId: string,
    options: RequestOptions = {},
  ): Promise<GroupGradesResponse> {
    const response = await api.get<GroupGradesResponse>(
      `/groups/${groupId}/grades`,
      options,
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, notas del grupo");
    }

    return response;
  },

  async getGroupGradesForSecretary(
    groupId: string,
    options: RequestOptions = {},
  ): Promise<GroupGradesResponse> {
    const response = await api.get<GroupGradesResponse>(
      `/groups/${groupId}/grades/secretary`,
      options,
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, notas del grupo para secretaria");
    }

    return response;
  },

  async updateStudentGrade(
    groupId: string,
    updateDto: UpdateGradeDto,
    options: RequestOptions = {},
  ): Promise<void> {
    await api.patch(`/groups/${groupId}/grades`, updateDto, options);
  },

  async updateMultipleGrades(
    groupId: string,
    updates: UpdateGradeDto[],
    options: RequestOptions = {},
  ): Promise<void> {
    await api.patch(`/groups/${groupId}/grades/bulk`, updates, options);
  },

  async getAcademicCourse(id: string, options: RequestOptions = {}) {
    const response = await api.get<AcademicGroupDTO>(
      `/groups/course/${id}`,
      options,
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, cursos");
    }

    return response;
  },

  async getTeacherSchedule(
    options: RequestOptions = {},
  ): Promise<AcademicGroupDTO[]> {
    const response = await api.get<AcademicGroupDTO[]>(
      "/groups/teacher/my-schedule",
      options,
    );

    if (!response) {
      throw new Error(
        "No se recibieron datos del servidor, horario del profesor",
      );
    }

    return response;
  },

  async getGroupsByCourse(
    courseId: string,
    options: RequestOptions = {},
  ): Promise<AcademicGroupDTO[]> {
    const response = await api.get<AcademicGroupDTO[]>(
      `/groups/by-course/${courseId}`,
      options,
    );

    if (!response) {
      throw new Error("No data received from the server for groups by course");
    }
    return response;
  },

  async getStudentsInGroup(
    groupId: string,
    options: RequestOptions = {},
  ): Promise<StudentUserDTO[]> {
    const response = await api.get<StudentUserDTO[]>(
      `/groups/${groupId}/students`,
      options,
    );

    return response;
  },

  async deleteScheduleSlot(
    scheduleSlotId: string,
    groupId: string,
    options: RequestOptions = {},
  ): Promise<void> {
    await api.delete<void>(
      `/groups/${groupId}/schedule/${scheduleSlotId}`,
      options,
    );
  },

  async updateAcademicGroup(
    groupId: string,
    payload: UpdateAcademicGroupPayload,
    options: RequestOptions = {},
  ): Promise<AcademicGroupDTO> {
    const response = await api.patch<AcademicGroupDTO>(
      `/groups/${groupId}`,
      payload,
      options,
    );
    if (!response) {
      throw new Error("No se recibió respuesta del servidor al actualizar el grupo académico.");
    }
    return response;
  },
};