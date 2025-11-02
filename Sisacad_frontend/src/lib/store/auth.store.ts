import { writable, derived, get } from 'svelte/store';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

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

    const token = localStorage.getItem('token');
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
      const response = await fetch(
        'http://sisacad.local.io:3000/user/profile',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error('Token inválido');
        }
        throw new Error('Error al cargar perfil');
      }

      const userData = await response.json();

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
      const response = await fetch(
        'http://sisacad.local.io:3000/auth/google/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ token: idToken }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en login');
      }

      const { accessToken } = await response.json();

      if (browser) {
        localStorage.setItem('token', accessToken);
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
      localStorage.removeItem('token');
    }

    set({
      token: null,
      user: null,
      isLoading: false,
      isInitialized: true,
    });

    goto('/login', { replaceState: true });
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
