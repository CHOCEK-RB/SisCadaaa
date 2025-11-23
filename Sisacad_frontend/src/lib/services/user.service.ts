import { api } from "$lib/services/api.service";
import type { UserProfileDTO } from "$lib/types/auth.types";

export const userService = {
  async getProfile(fetcher?: typeof fetch) {
    console.log("UserService.getProfile llamado");

    const response = await api.get<UserProfileDTO>("/user/profile", {
      fetch: fetcher,
    });

    if (!response) {
      throw new Error(
        "No se recibieron datos del servidor, usuario no encontrado o sesión expirada",
      );
    }

    return response;
  },
};
