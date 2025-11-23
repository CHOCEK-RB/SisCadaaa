<script lang="ts">
  import { onMount } from "svelte";
  import { authStore, isInitialized } from "$lib/store/auth.store";
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  let { children } = $props();

  onMount(() => {
    authStore.initialize();
  });
</script>

{#if $isInitialized}
  <ModeWatcher />
  {@render children?.()}
{:else}
  <div class="fixed inset-0 flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div
        class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-600">Cargando...</p>
    </div>
  </div>
{/if}
