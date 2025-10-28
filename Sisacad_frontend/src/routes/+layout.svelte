<script lang="ts">
  import '../app.css';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import favicon from '$lib/assets/favicon.svg';

  export let data;

  $: userProfile = data.userProfile;

  function handleLogout() {
    document.cookie =
      'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax';
    localStorage.removeItem('jwt_token');
    goto(resolve('/login'));
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title
    >{userProfile ? `${userProfile.role} - Sisacad` : 'Sisacad Login'}</title
  >
</svelte:head>

{#if userProfile}
  <div class="flex h-screen bg-gray-100">
    <Sidebar
      userRole={userProfile.role}
      userEmail={userProfile.email}
      userIconUrl={userProfile.iconURL}
      onLogout={handleLogout}
    />

    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="bg-white shadow-sm print:hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <h1 class="text-xl font-semibold text-gray-900 capitalize">
            Panel de {userProfile.role}
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

<style lang="postcss">
  @media print {
    .print\:hidden {
      display: none;
    }
  }
</style>
