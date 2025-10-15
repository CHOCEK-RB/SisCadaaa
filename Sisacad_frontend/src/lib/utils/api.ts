import { browser } from '$app/environment';
import { PUBLIC_API_URL } from '$env/static/public';
import { goto } from '$app/navigation';
import { authStore } from '$lib/store/auth.store';

export async function fetchApi(path: string, options: RequestInit = {}) {
  let token: string | null = null;

  if (browser) {
    token = localStorage.getItem('jwt_token');
  }

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(`${PUBLIC_API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && browser) {
        authStore.logout();
        goto('/login');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    if (response.status === 204) {
      return;
    }

    return response.json();
  } catch (error) {
    console.error(`API call to ${path} failed:`, error);
    throw error;
  }
}
