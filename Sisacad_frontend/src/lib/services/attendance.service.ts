import { api } from './api.service';
import type { GroupAttendanceDTO } from '$lib/types/attendance.types';

export const attendanceService = {
  async getGroupAttendance(groupID: string, token: string) {
    const response = await api.get<GroupAttendanceDTO[]>(
      `/attendance/my-attendance/${groupID}`,
      { token: token },
    );

    if (!response) {
      throw new Error('No se recibieron datos del servidor, asistencia');
    }

    return response;
  },
};
