<script lang="ts">
  import {
    currentUser,
    isAuthenticated,
    userRole,
  } from "$lib/store/auth.store";

  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "$lib/components/app-sidebar.svelte";

  let { children } = $props();

  if ($userRole !== "teacher") {
    window.location.href = "/";
  }
</script>

{#if $isAuthenticated && $currentUser}
  <Sidebar.Provider style="--sidebar-width: 20rem;">
    <AppSidebar />
    <Sidebar.Inset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4">
          <Sidebar.Trigger style=" --spacing: 0.5rem;" />

          <title>Home - Sisacad</title>
        </div>
      </header>
      <main>
        {@render children?.()}
      </main>
    </Sidebar.Inset>
  </Sidebar.Provider>
{:else}
  <div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <div
        class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-600">Cargando...</p>
    </div>
  </div>
{/if}
