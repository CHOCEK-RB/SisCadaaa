import { writable, derived, get } from 'svelte/store';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { userService } from '$lib/services/user.service';
import { authService } from '$lib/services/auth.service';
import { resolve } from '$app/paths';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'secretary' | 'admin' | 'unknown';
  isActive: boolean;
  cui?: string;
  semester?: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  isInitialized: false,
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  function initialize() {
    if (!browser) return;

    const token = localStorage.getItem('jwt_token');
    if (token) {
      update((state) => ({
        ...state,
        token,
        isLoading: true,
      }));

      loadUserProfile(token).finally(() => {
        update((state) => ({ ...state, isInitialized: true }));
      });
    } else {
      update((state) => ({ ...state, isInitialized: true }));
    }
  }

  async function loadUserProfile(token?: string) {
    const currentToken = token || get({ subscribe }).token;

    if (!currentToken) {
      console.warn('No token available to load profile');
      return;
    }

    update((state) => ({ ...state, isLoading: true }));

    try {
      const response = await userService.getProfile(currentToken);

      const userData = response;

      update((state) => ({
        ...state,
        user: userData,
        isLoading: false,
      }));

      console.log('Perfil cargado:', userData);
      return userData;
    } catch (error) {
      console.error('Error loading user profile:', error);
      update((state) => ({
        ...state,
        isLoading: false,
        user: null,
      }));
      throw error;
    }
  }

  async function loginWithGoogle(idToken: string) {
    update((state) => ({ ...state, isLoading: true }));

    try {
      const response = await authService.login(idToken);

      const { accessToken } = await response;

      if (browser) {
        localStorage.setItem('jwt_token', accessToken);
      }

      update((state) => ({
        ...state,
        token: accessToken,
        isLoading: true,
      }));

      await loadUserProfile(accessToken);

      return accessToken;
    } catch (error) {
      console.error('Login error:', error);
      update((state) => ({
        ...state,
        isLoading: false,
        token: null,
        user: null,
      }));
      throw error;
    }
  }

  function logout() {
    if (browser) {
      localStorage.removeItem('jwt-token');
    }

    set({
      token: null,
      user: null,
      isLoading: false,
      isInitialized: true,
    });

    goto(resolve('/login'), { replaceState: true });
  }

  async function refreshProfile() {
    const currentState = get({ subscribe });
    if (currentState.token) {
      await loadUserProfile(currentState.token);
    }
  }

  return {
    subscribe,
    initialize,
    loginWithGoogle,
    logout,
    loadUserProfile,
    refreshProfile,
    getToken: () => get({ subscribe }).token,
    getUser: () => get({ subscribe }).user,
    isAuthenticated: () => !!get({ subscribe }).token,
  };
}

export const authStore = createAuthStore();

export const isAuthenticated = derived(
  authStore,
  ($auth) => !!$auth.token && !!$auth.user,
);

export const currentUser = derived(authStore, ($auth) => $auth.user);

export const userRole = derived(
  authStore,
  ($auth) => $auth.user?.role || 'unknown',
);

export const isLoading = derived(authStore, ($auth) => $auth.isLoading);

export const isInitialized = derived(authStore, ($auth) => $auth.isInitialized);
