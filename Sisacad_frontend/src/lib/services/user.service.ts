import { api, type RequestOptions } from "$lib/services/api.service";
import type { UserProfileDTO } from "$lib/types/auth.types";

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
};
