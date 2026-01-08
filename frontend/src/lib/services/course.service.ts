import { api } from "./api.service";
import type { CourseDTO } from "$lib/types/course.types";

export const courseService = {
  async searchCourses(term: string): Promise<CourseDTO[]> {
    const response = await api.get<CourseDTO[]>(`/courses/search?q=${term}`);
    if (!response) {
      throw new Error("No data received from the server for courses search");
    }
    return response;
  },
};
