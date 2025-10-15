<script lang="ts">
  import { authStore } from '$lib/store/auth.store';
  import { goto } from '$app/navigation';

  function handleLogout() {
    authStore.logout();
    document.cookie =
      'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    goto('/login');
  }
</script>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white shadow-sm">
    <nav class="container mx-auto px-4 py-3 flex justify-between items-center">
      <div class="text-lg font-bold text-gray-800">Sistema Académico</div>
      <div>
        {#if $authStore}
          <span class="text-gray-600 mr-4">Hola, {$authStore.email}</span>
          <button
            on:click={handleLogout}
            class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
          >
            Cerrar Sesión
          </button>
        {/if}
      </div>
    </nav>
  </header>

  <main class="container mx-auto p-4 mt-4">
    <slot />
  </main>
</div>
