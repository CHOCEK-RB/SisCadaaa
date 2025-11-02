import { api } from '$lib/services/api.service';
import type { UserProfileDTO } from '$lib/types/auth.types';

export const userService = {
  async getProfile(token: string) {
    console.log('Fetching user profile');

    const response = await api.get<UserProfileDTO>('/user/profile', {
      token: token,
    });

    if (!response) {
      throw new Error(
        'No se recibieron datos del servidor, usuario no encontrado',
      );
    }

    return response;
  },
};
