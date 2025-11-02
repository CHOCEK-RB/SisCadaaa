<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { authStore } from '$lib/store/auth.store';
  import { clearAuthToken } from '$lib/utils/auth-helpers';
  import favicon from '$lib/assets/favicon.svg';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  $: user = data.user;
  $: profile = data.profile;

  $: displayUser = profile || user;

  onMount(() => {
    if (user) {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('jwt_token='))
        ?.split('=')[1];

      if (token) {
        authStore.login(token);
      }
    } else {
      authStore.logout();
    }
  });

  function handleLogout() {
    clearAuthToken();
    goto(resolve('/login'));
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>
    {displayUser
      ? `${displayUser.role || 'Usuario'} - Sisacad`
      : 'Sisacad Login'}
  </title>
</svelte:head>

{#if displayUser}
  <div class="flex h-screen bg-gray-100">
    <Sidebar
      userRole={displayUser.role || 'user'}
      userEmail={displayUser.email}
      userIconUrl={displayUser.iconURL || displayUser.pictureURL}
      onLogout={handleLogout}
    />
    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="bg-white shadow-sm print:hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <h1 class="text-xl font-semibold text-gray-900 capitalize">
            Panel de {displayUser.role || 'Usuario'}
          </h1>
        </div>
      </header>
      <div class="flex-1 overflow-y-auto p-4 md:p-6">
        {#key page.url.pathname}
          <slot />
        {/key}
      </div>
    </main>
  </div>
{:else}
  <slot />
{/if}
*/
