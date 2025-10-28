<script module lang="ts">
  interface GoogleCredentialResponse {
    credential: string;
  }

  declare global {
    interface Window {
      handleGoogleSignIn: (response: GoogleCredentialResponse) => void;

      google: {
        accounts: {
          id: {
            initialize: (config: {
              client_id: string;
              callback: (response: GoogleCredentialResponse) => void;
            }) => void;
            renderButton: (parent: HTMLElement, options: object) => void;
          };
        };
      };
    }
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
  import { fetchApi } from '$lib/utils/api';
  import { resolve } from '$app/paths';
  import { authStore } from '$lib/store/auth.store';

  let errorMessage: string | null = null;
  const redirectTo: string | null = $derived(
    page.url.searchParams.get('redirectTo'),
  );

  onMount(() => {
    window.handleGoogleSignIn = async (response: GoogleCredentialResponse) => {
      errorMessage = null;
      const idToken = response.credential;

      try {
        const data = await fetchApi('/auth/google/login', {
          method: 'POST',
          body: JSON.stringify({ token: idToken }),
        });

        localStorage.setItem('jwt_token', data.accessToken);
        document.cookie = `jwt_token=${data.accessToken}; path=/; max-age=86400; samesite=lax`;

        authStore.initialize();

        if (redirectTo) {
          console.log(`Login successful, redirecting to: ${redirectTo}`);
          goto(resolve(redirectTo));
        } else {
          console.log('Login successful, redirecting to home');
          goto(resolve('/home'));
        }
      } catch (error: unknown) {
        console.error('Login failed:', error);

        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          errorMessage = 'An unknown error occurred.';
        }

        authStore.logout();
        document.cookie =
          'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    };

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: PUBLIC_GOOGLE_CLIENT_ID,
        callback: window.handleGoogleSignIn,
      });

      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer) {
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
        });
      } else {
        console.error('Google Sign-In button container not found.');
      }
    } else {
      console.error('Google Identity Services script not loaded yet.');
    }
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

    <div id="google-signin-button" class="flex justify-center"></div>

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
