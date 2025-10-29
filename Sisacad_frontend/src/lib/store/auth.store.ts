import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface UserSession {
  sub: string;
  email: string;
  pictureURL: string;
  role?: string;
  iat?: number;
  exp: number;
}

function createAuthStore() {
  const { subscribe, set } = writable<UserSession | null>(null);

  function initialize() {
    if (!browser) return;

    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = atob(payloadBase64);
        const user = JSON.parse(decodedPayload) as UserSession;

        if (Date.now() >= user.exp * 1000) {
          logout();
        } else {
          set(user);
        }
      } catch (e) {
        console.error('Failed to parse JWT, logging out.', e);
        logout();
      }
    }
  }

  function logout() {
    if (!browser) return;
    localStorage.removeItem('jwt_token');
    set(null);
  }

  initialize();

  return {
    subscribe,
    logout,
    initialize,
  };
}

export const authStore = createAuthStore();
