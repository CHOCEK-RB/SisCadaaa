<script context="module" lang="ts">
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
  import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
  import { fetchApi } from '$lib/utils/api';

  let errorMessage: string | null = null;

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
        document.cookie = `jwt_token=${data.accessToken}; path=/; max-age=86400; samesite=lax; secure`;

        goto('/dashboard');
      } catch (error: unknown) {
        console.error('Login failed:', error);

        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          errorMessage = 'An unknown error occurred.';
        }
      }
    };

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: PUBLIC_GOOGLE_CLIENT_ID,
        callback: window.handleGoogleSignIn,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button')!,
        {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
        },
      );
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
        class="mt-6 p-3 bg-red-100 border-red-400 text-red-700 rounded-md text-center"
      >
        <p>{errorMessage}</p>
      </div>
    {/if}

    <div class="mt-8 text-center text-sm text-gray-400">
      <p>Usa tu cuenta institucional para acceder.</p>
    </div>
  </div>
</div>
