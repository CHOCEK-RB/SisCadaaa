import { api, type RequestOptions } from "$lib/services/api.service";
import { browser } from "$app/environment";

export interface AuthResponse {
  success: boolean;
  user?: any;
}

export const authService = {
  async login(
    idToken: string,
    options: RequestOptions = {},
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/auth/google/login",
      {
        token: idToken,
      },
      options,
    );

    if (!response || !response.success) {
      throw new Error("La autenticación falló");
    }

    console.log("Usuario autenticado correctamente");
    return response;
  },

  async logout(options: RequestOptions = {}): Promise<void> {
    await api.post("/auth/logout", {}, options);

    if (browser) {
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
    }

    console.log("Sesión cerrada correctamente");
  },
};
