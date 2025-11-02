import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { UserSession } from '$lib/types/auth.types';

function createAuthStore() {
  const { subscribe, set, update } = writable<UserSession | null>(null);

  function decodeJWT(token: string): UserSession | null {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) {
        throw new Error('Invalid JWT format');
      }
      const decodedPayload = atob(payloadBase64);
      const user = JSON.parse(decodedPayload) as UserSession;
      return user;
    } catch (e) {
      console.error('Failed to parse JWT:', e);
      return null;
    }
  }

  function isTokenExpired(user: UserSession): boolean {
    return Date.now() >= user.exp * 1000;
  }

  function getStoredToken(): string | null {
    if (!browser) return null;
    return localStorage.getItem('jwt_token');
  }

  function saveToken(token: string): void {
    if (!browser) return;
    localStorage.setItem('jwt_token', token);
  }

  function removeToken(): void {
    if (!browser) return;
    localStorage.removeItem('jwt_token');
  }

  function initialize(): void {
    if (!browser) return;

    const token = getStoredToken();
    if (!token) {
      set(null);
      return;
    }

    const user = decodeJWT(token);
    if (!user) {
      logout();
      return;
    }

    if (isTokenExpired(user)) {
      console.log('Token expired, logging out');
      logout();
      return;
    }

    set(user);
  }

  function login(token: string): boolean {
    if (!browser) return false;

    const user = decodeJWT(token);
    if (!user) {
      return false;
    }

    if (isTokenExpired(user)) {
      console.error('Cannot login with expired token');
      return false;
    }

    saveToken(token);
    set(user);
    return true;
  }

  function logout(): void {
    if (!browser) return;
    removeToken();
    set(null);
  }

  function isAuthenticated(): boolean {
    const token = getStoredToken();
    if (!token) return false;

    const user = decodeJWT(token);
    if (!user) return false;

    return !isTokenExpired(user);
  }

  function getToken(): string | null {
    return getStoredToken();
  }

  initialize();

  return {
    subscribe,
    login,
    logout,
    initialize,
    isAuthenticated,
    getToken,
  };
}

export const authStore = createAuthStore();
