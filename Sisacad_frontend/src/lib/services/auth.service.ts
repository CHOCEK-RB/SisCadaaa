import { api } from '$lib/services/api.service';

export interface AuthToken {
  accessToken: string;
}

export const authService = {
  async login(idToken: string) {
    const response = await api.post<AuthToken>('/auth/google/login', {
      token: idToken,
    });

    if (!response) {
      throw new Error('No se recibió respuesta del servidor');
    }

    if (!response.accessToken) {
      throw new Error('No se recibió el token de acceso');
    }

    localStorage.setItem('jwt_token', response.accessToken);

    return response;
  },

  async logout() {
    localStorage.removeItem('jwt_token');
  },
};
