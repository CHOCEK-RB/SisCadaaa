import { api, type RequestOptions } from "$lib/services/api.service";
import type { UserProfileDTO } from "$lib/types/auth.types";
import type {
  FindAllUsersOptions,
  PaginatedResult,
} from "$lib/types/user.types";

export const userService = {
  async getProfile(options: RequestOptions = {}) {
    console.log("UserService.getProfile llamado");

    const response = await api.get<UserProfileDTO>("/user/profile", options);

    if (!response) {
      throw new Error(
        "No se recibieron datos del servidor, usuario no encontrado o sesión expirada",
      );
    }

    return response;
  },

  async getUsers(options: FindAllUsersOptions & RequestOptions = {}) {
    console.log("UserService.getUsers llamado con opciones:", options);

    const params = new URLSearchParams();
    if (options.role) params.append("role", options.role);
    if (options.searchQuery) params.append("searchQuery", options.searchQuery);
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.order) params.append("order", options.order);

    const queryString = params.toString();
    const endpoint = `/user${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<PaginatedResult<UserProfileDTO>>(
      endpoint,
      options,
    );

    if (!response) {
      throw new Error("No se pudieron obtener los usuarios");
    }

    return response;
  },

  async getStudents(options: FindAllUsersOptions & RequestOptions = {}) {
    console.log("UserService.getStudents llamado con opciones:", options);

    const params = new URLSearchParams();
    if (options.searchQuery) params.append("searchQuery", options.searchQuery);
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.order) params.append("order", options.order);

    const queryString = params.toString();
    const endpoint = `/students${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<PaginatedResult<UserProfileDTO>>(
      endpoint,
      options,
    );

    if (!response) {
      throw new Error("No se pudieron obtener los estudiantes");
    }

    return response;
  },

  async getTeachers(options: FindAllUsersOptions & RequestOptions = {}) {
    console.log("UserService.getTeachers llamado con opciones:", options);

    const params = new URLSearchParams();
    if (options.searchQuery) params.append("searchQuery", options.searchQuery);
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.order) params.append("order", options.order);

    const queryString = params.toString();
    const endpoint = `/teachers${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<PaginatedResult<UserProfileDTO>>(
      endpoint,
      options,
    );

    if (!response) {
      throw new Error("No se pudieron obtener los profesores");
    }

    return response;
  },

  async searchTeachers(term: string): Promise<{ id: string; name: string }[]> {
    const response = await this.getTeachers({ searchQuery: term, limit: 10 }); // Limit to 10 results for search suggestions
    if (!response || !response.data) {
      return [];
    }
    return response.data.map(teacher => ({ id: teacher.id, name: `${teacher.firstName} ${teacher.lastName}` }));
  },

  async getStudentById(id: string, options: RequestOptions = {}) {
    console.log(`UserService.getStudentById llamado para ID: ${id}`);
    
    const response = await api.get<UserProfileDTO>(`/students/${id}`, options);

    if (!response) {
      throw new Error("No se pudo encontrar el estudiante solicitado");
    }

    return response;
  },

  async getTeacherById(id: string, options: RequestOptions = {}) {
    console.log(`UserService.getTeacherById llamado para ID: ${id}`);
    
    const response = await api.get<UserProfileDTO>(`/teachers/${id}`, options);

    if (!response) {
      throw new Error("No se pudo encontrar el profesor solicitado");
    }

    return response;
  },
};
