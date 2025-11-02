<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';

  import { authService } from '$lib/services/auth.service';
  import { authStore } from '$lib/store/auth.store';
  import { GoogleAuthManager } from '$lib/utils/google-auth';
  import {
    saveAuthToken,
    clearAuthToken,
    getRedirectPath,
  } from '$lib/utils/auth-helpers';
  import type { GoogleCredentialResponse } from '$lib/types/google.types';

  let errorMessage: string | null = $state(null);
  let isLoading: boolean = $state(false);

  const googleAuth = new GoogleAuthManager(PUBLIC_GOOGLE_CLIENT_ID);

  async function handleGoogleSignIn(
    response: GoogleCredentialResponse,
  ): Promise<void> {
    errorMessage = null;
    isLoading = true;

    console.log('Google sign-in response:', response.credential);

    try {
      const data = await authService.login(response.credential);

      const success = saveAuthToken(data.accessToken);

      if (!success) {
        throw new Error('Token inválido o expirado');
      }

      const redirectPath = getRedirectPath(page.url.searchParams);
      console.log(`Login successful, redirecting to: ${redirectPath}`);

      await goto(resolve(redirectPath));
    } catch (error: unknown) {
      console.error('Login failed:', error);

      errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';

      clearAuthToken();
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    if (authStore.isAuthenticated()) {
      const redirectPath = getRedirectPath(page.url.searchParams);
      goto(resolve(redirectPath));
      return;
    }

    googleAuth.setup(handleGoogleSignIn);
  });
</script>

<div
  class="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4"
>
  <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Sistema Académico</h1>
      <p class="text-gray-500 mt-2">
        Bienvenido. Inicia sesión para continuar.
      </p>
    </div>

    <div id="google-signin-button" class="flex justify-center">
      {#if isLoading}
        <div class="text-center text-gray-500">Iniciando sesión...</div>
      {/if}
    </div>

    {#if errorMessage}
      <div
        class="mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center"
        role="alert"
      >
        <p>{errorMessage}</p>
      </div>
    {/if}

    <div class="mt-8 text-center text-sm text-gray-400">
      <p>Usa tu cuenta institucional para acceder.</p>
    </div>
  </div>
</div>
*/
