import { writable, derived, get } from "svelte/store";
import { goto, invalidateAll } from "$app/navigation";
import { browser } from "$app/environment";
import { userService } from "$lib/services/user.service";
import { authService } from "$lib/services/auth.service";
import { resolve } from "$app/paths";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "student" | "teacher" | "secretary" | "admin" | "unknown";
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

let isInitializing = false;

const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  isInitialized: false,
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  function initialize() {
    if (!browser || isInitializing) return;

    console.log("Inicializando store de autenticación...");
    isInitializing = true;

    loadUserProfile()
      .then(() => {
        console.log("Perfil cargado correctamente en initialize");
      })
      .catch((error) => {
        console.log("Error al cargar perfil en initialize:", error);
      })
      .finally(() => {
        console.log("Finalizando inicialización del store");
        update((state) => ({ ...state, isInitialized: true }));
        console.log("isInitialized actualizado a true");
        isInitializing = false;
      });
  }

  async function loadUserProfile(token?: string) {
    console.log("loadUserProfile llamado con token:", token);

    const currentToken =
      token && token !== "cookie_auth" ? token : get({ subscribe }).token;
    console.log("currentToken usado:", currentToken);

    update((state) => ({ ...state, isLoading: true }));

    try {
      console.log("Llamando a userService.getProfile...");
      const response = await userService.getProfile();
      console.log("Respuesta de userService.getProfile recibida:", response);

      const userData = response;

      update((state) => ({
        ...state,
        user: userData,
        token:
          currentToken && currentToken !== "cookie_auth" ? currentToken : null,
        isLoading: false,
      }));

      console.log("Perfil cargado:", userData);
      return userData;
    } catch (error) {
      console.error("Error loading user profile:", error);
      update((state) => ({
        ...state,
        isLoading: false,
        user: null,
        token: null,
      }));
      return null;
    }
  }

  async function loginWithGoogle(idToken: string) {
    update((state) => ({ ...state, isLoading: true }));

    try {
      await authService.login(idToken);

      await loadUserProfile();

      invalidateAll();

      update((state) => ({ ...state, isInitialized: true }));

      console.log("Usuario logueado exitosamente");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      update((state) => ({
        ...state,
        token: null,
        user: null,
      }));
      throw error;
    } finally {
      update((state) => ({ ...state, isLoading: false }));
    }
  }

  async function logout() {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }

    if (browser) {
      localStorage.removeItem("jwt-token");
    }

    set({
      token: null,
      user: null,
      isLoading: false,
      isInitialized: true,
    });

    goto(resolve("/login"), { replaceState: true });
  }

  async function refreshProfile() {
    await loadUserProfile();
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
    isAuthenticated: () => !!get({ subscribe }).user,
  };
}

export const authStore = createAuthStore();

export const isAuthenticated = derived(authStore, ($auth) => !!$auth.user);

export const currentUser = derived(authStore, ($auth) => $auth.user);

export const userRole = derived(
  authStore,
  ($auth) => $auth.user?.role || "unknown",
);

export const isLoading = derived(authStore, ($auth) => $auth.isLoading);

export const isInitialized = derived(authStore, ($auth) => $auth.isInitialized);
