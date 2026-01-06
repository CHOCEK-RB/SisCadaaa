import { api, type RequestOptions } from './api.service';
import type { Classroom, ClassroomSchedule } from '$lib/types/classroom.types';

export const classroomService = {
  async getAllClassrooms(options: RequestOptions = {}): Promise<Classroom[] | null> {
    return await api.get<Classroom[]>('/classrooms', options);
  },

  async findById(id: string, options: RequestOptions = {}): Promise<Classroom | null> {
    return await api.get<Classroom>(`/classrooms/${id}`, options);
  },

  async getScheduleForClassroom(id: string, options: RequestOptions = {}): Promise<ClassroomSchedule | null> {
    return await api.get<ClassroomSchedule>(`/classrooms/${id}/schedule`, options);
  }
};
