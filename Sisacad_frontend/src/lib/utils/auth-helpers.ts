import { authStore } from '$lib/store/auth.store';

export function saveAuthToken(token: string, maxAge: number = 86400): boolean {
  document.cookie = `jwt_token=${token}; path=/; max-age=${maxAge}; samesite=lax`;

  return authStore.login(token);
}

export function clearAuthToken(): void {
  document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  authStore.logout();
}

export function getRedirectPath(
  searchParams: URLSearchParams,
  defaultPath: string = '/',
): string {
  const redirectTo = searchParams.get('redirectTo');

  if (redirectTo) {
    return redirectTo;
  }

  const user = authStore.getUser();

  if (user) {
    switch (user.role) {
      case 'student':
        return '/student';
      case 'teacher':
        return '/teacher';
      case 'secretary':
        return '/secretary';
      case 'admin':
        return '/admin';
      default:
        return defaultPath;
    }
  }

  return defaultPath;
}
