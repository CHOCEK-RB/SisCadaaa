<script lang="ts">
  import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { authStore, isAuthenticated } from "$lib/store/auth.store";
  import { resolve } from "$app/paths";

  let isLoading = false;
  let error = "";

  $: if ($isAuthenticated) {
    const user = authStore.getUser();
    if (user) {
      goto(resolve("/"), { replaceState: true });
    }
  }

  onMount(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button")!,
          {
            theme: "outline",
            size: "large",
            text: "signin_with",
          },
        );
      }
    };
  });

  async function handleCredentialResponse(response: any) {
    isLoading = true;
    error = "";

    try {
      await authStore.loginWithGoogle(response.credential);
    } catch (err: any) {
      console.error("Login failed:", err);
      error =
        err.message || "Error al iniciar sesión. Por favor intenta de nuevo.";
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Login - SisAcad</title>
</svelte:head>

<div
  class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4"
>
  <div class="w-full max-w-md space-y-8">
    <div class="text-center">
      <div
        class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 shadow-lg"
      >
        <svg
          class="h-12 w-12 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
      <h2 class="mt-6 text-4xl font-extrabold text-gray-900">SisAcad</h2>
      <p class="mt-2 text-sm text-gray-600">Sistema Académico Universitario</p>
    </div>

    <div class="rounded-2xl bg-white px-6 py-8 shadow-xl">
      <div class="space-y-6">
        <div>
          <h3 class="mb-2 text-center text-xl font-semibold text-gray-900">
            Iniciar Sesión
          </h3>
          <p class="text-center text-sm text-gray-600">
            Usa tu cuenta institucional para continuar
          </p>
        </div>

        {#if error}
          <div
            class="relative rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
            role="alert"
          >
            <span class="block sm:inline">{error}</span>
          </div>
        {/if}

        <div class="flex justify-center">
          {#if isLoading}
            <div class="flex flex-col items-center space-y-3">
              <div
                class="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
              ></div>
              <p class="text-sm text-gray-600">Iniciando sesión...</p>
            </div>
          {:else}
            <div id="google-signin-button"></div>
          {/if}
        </div>

        <div class="text-center">
          <p class="text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros términos de servicio y política
            de privacidad
          </p>
        </div>
      </div>
    </div>

    <div class="text-center">
      <p class="text-xs text-gray-500">
        © 2025 SisAcad. Todos los derechos reservados.
      </p>
    </div>
  </div>
</div>
