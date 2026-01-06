import { api } from "./api.service";
import type { GroupAttendanceDTO } from "$lib/types/attendance.types";
import type { RequestOptions } from "./api.service";

export interface StudentAttendanceInfo {
  studentId: string;
  cui: string;
  firstName: string;
  lastName: string;
  status: "present" | "absent";
}

export interface GroupAttendanceRecord {
  attendanceId: string;
  classDate: string;
  students: StudentAttendanceInfo[];
}

export interface TakeAttendanceResponse {
  canTakeAttendance: boolean;
  reason?: string;
  currentSchedule?: {
    day: string;
    start: string;
    end: string;
    classroom: string;
  };
  todayAttendance?: {
    attendanceId: string;
    students: StudentAttendanceInfo[];
  };
}

export interface UpdateAttendanceDto {
  studentStatuses: Record<string, "present" | "absent">;
}

export const attendanceService = {
  async getGroupAttendance(groupID: string, options: RequestOptions = {}) {
    const response = await api.get<GroupAttendanceDTO[]>(
      `/attendance/my-attendance/${groupID}`,
      options,
    );

    if (!response) {
      throw new Error("No se recibieron datos del servidor, asistencia");
    }

    return response;
  },

  async checkCanTakeAttendance(
    groupId: string,
    options: RequestOptions = {},
  ): Promise<TakeAttendanceResponse> {
    const response = await api.get<TakeAttendanceResponse>(
      `/attendance/group/${groupId}/check`,
      options,
    );

    if (!response) {
      throw new Error(
        "No se recibieron datos del servidor, verificación de asistencia",
      );
    }

    return response;
  },

  async takeAttendance(
    groupId: string,
    updateDto: UpdateAttendanceDto,
    options: RequestOptions = {},
  ): Promise<void> {
    await api.post(`/attendance/group/${groupId}/take`, updateDto, options);
  },

  async getGroupAttendanceHistory(
    groupId: string,
    options: RequestOptions = {},
  ): Promise<GroupAttendanceRecord[]> {
    const response = await api.get<GroupAttendanceRecord[]>(
      `/attendance/group/${groupId}/history`,
      options,
    );

    if (!response) {
      throw new Error(
        "No se recibieron datos del servidor, historial de asistencias",
      );
    }

    return response;
  },
};
