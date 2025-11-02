import { api } from '$lib/services/api.service';
import { browser } from '$app/environment';

export interface AuthToken {
  accessToken: string;
}

export const authService = {
  async login(idToken: string): Promise<AuthToken> {
    const response = await api.post<AuthToken>('/auth/google/login', {
      token: idToken,
    });

    if (!response) {
      throw new Error('No se recibió respuesta del servidor');
    }

    if (!response.accessToken) {
      throw new Error('No se recibió el token de acceso');
    }

    if (browser) {
      localStorage.setItem('jwt_token', response.accessToken);

      const maxAge = 86400;
      document.cookie = `jwt_token=${response.accessToken}; path=/; max-age=${maxAge}; samesite=lax`;
    }

    console.log('Token saved successfully');
    return response;
  },

  async logout(): Promise<void> {
    if (!browser) return;

    localStorage.removeItem('jwt_token');

    document.cookie =
      'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    console.log('Auth tokens cleared');
  },
};
