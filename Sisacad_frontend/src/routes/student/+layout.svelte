<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import {
    authStore,
    currentUser,
    isAuthenticated,
  } from '$lib/store/auth.store';

  import { writable } from 'svelte/store';
  import { resolve } from '$app/paths';

  import {
    House,
    BookOpen,
    SquareCheck,
    Calendar,
    BookOpenText,
  } from 'lucide-svelte';

  let isSidebarOpen = writable(true);

  onMount(() => {
    const saved = sessionStorage.getItem('sidebarOpen');
    if (saved !== null) {
      isSidebarOpen.set(saved === 'true');
    }

    if (!$currentUser && authStore.getToken()) {
      authStore.loadUserProfile().catch((error) => {
        console.error('Error loading profile:', error);
        goto(resolve('/login'), { replaceState: true });
      });
    }
  });

  $: if (!$isAuthenticated) {
    goto(resolve('/login'), { replaceState: true });
  }

  $: if ($currentUser && $currentUser.role !== 'student') {
    goto(resolve('/'), { replaceState: true });
  }

  function handleLogout() {
    authStore.logout();
  }

  function toggleSidebar() {
    isSidebarOpen.update((val) => {
      const newVal = !val;
      sessionStorage.setItem('sidebarOpen', String(newVal));
      return newVal;
    });
  }

  const menuItems = [
    {
      name: 'Dashboard',
      icon: House,
      path: '/student',
    },
    {
      name: 'Mis Cursos',
      icon: BookOpen,
      path: '/student/courses',
    },
    {
      name: 'Notas',
      icon: SquareCheck,
      path: '/student/grades',
    },
    {
      name: 'Horario',
      icon: Calendar,
      path: '/student/schedule',
    },
  ];
</script>

{#if $isAuthenticated && $currentUser}
  <div class="min-h-screen bg-gray-50 flex">
    {#if $isSidebarOpen}
      <div
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        on:click={toggleSidebar}
        on:keydown={(e) => e.key === 'Escape' && toggleSidebar()}
        role="button"
        tabindex="0"
        aria-label="Cerrar menú"
      ></div>
    {/if}

    <aside
      class="fixed top-0 left-0 h-screen w-64 bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out"
      class:-translate-x-full={!$isSidebarOpen}
      class:translate-x-0={$isSidebarOpen}
    >
      <div
        class="h-16 flex items-center justify-between px-6 border-b border-gray-200 flex-shrink-0"
      >
        <div class="flex items-center space-x-3">
          <div
            class="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center"
          >
            <BookOpenText class="w-6 h-6 text-white" />
          </div>
          <span class="text-xl font-bold text-gray-900">SisAcad</span>
        </div>

        <button
          on:click={toggleSidebar}
          class="lg:hidden p-1 rounded-md hover:bg-gray-100"
        >
          <svg
            class="h-6 w-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="p-6 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center space-x-3">
          <div
            class="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <span class="text-blue-600 font-semibold text-lg">
              {$currentUser.firstName.charAt(0)}{$currentUser.lastName.charAt(
                0,
              )}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">
              {$currentUser.firstName}
              {$currentUser.lastName}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {$currentUser.email}
            </p>
            {#if $currentUser.cui}
              <p class="text-xs text-gray-400">CUI: {$currentUser.cui}</p>
            {/if}
          </div>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto p-4 space-y-2">
        {#each menuItems as item (item.path)}
          {@const Icon = item.icon}
          <a
            href={item.path}
            class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
            class:bg-blue-50={page.url.pathname === item.path}
            class:text-blue-600={page.url.pathname === item.path}
            class:text-gray-700={page.url.pathname !== item.path}
            class:hover:bg-gray-100={page.url.pathname !== item.path}
            on:click={() => window.innerWidth < 1024 && toggleSidebar()}
          >
            <Icon class="h-5 w-5 flex-shrink-0" />
            <span class="font-medium">{item.name}</span>
          </a>
        {/each}
      </nav>

      <div class="p-4 border-t border-gray-200 flex-shrink-0">
        <button
          on:click={handleLogout}
          class="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <svg
            class="h-5 w-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span class="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <div
      class="min-h-screen transition-all duration-300 ease-in-out flex-1 flex flex-col"
      style="margin-left: {$isSidebarOpen ? '16rem' : '0'}"
    >
      <header
        class="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-6 flex-shrink-0 sticky top-0 z-30"
      >
        <button
          on:click={toggleSidebar}
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            class="h-6 w-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {#if $isSidebarOpen}
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            {:else}
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            {/if}
          </svg>
        </button>
      </header>

      <main class="p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
{:else}
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div
        class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-600">Cargando...</p>
    </div>
  </div>
{/if}
