<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { authStore, isLoading } from "$lib/store/auth.store";
  import { resolve } from "$app/paths";

  onMount(async () => {
    const token = authStore.getToken();

    if (!token) {
      goto(resolve("/login"), { replaceState: true });
      return;
    }

    const user = authStore.getUser();

    if (!user) {
      try {
        await authStore.loadUserProfile();
        redirectBasedOnRole();
      } catch (error) {
        console.error("Error loading profile:", error);
        goto(resolve("/login"), { replaceState: true });
      }
    } else {
      redirectBasedOnRole();
    }
  });

  function redirectBasedOnRole() {
    const role = authStore.getUser()?.role;

    switch (role) {
      case "student":
        goto(resolve("/student"), { replaceState: true });
        break;
      case "teacher":
        goto(resolve("/teacher"), { replaceState: true });
        break;
      case "secretary":
        goto("/secretary", { replaceState: true });
        break;
      case "admin":
        goto("/admin", { replaceState: true });
        break;
      default:
        goto(resolve("/login"), { replaceState: true });
    }
  }
</script>

{#if $isLoading}
  <div class="fixed inset-0 flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div
        class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-600">Redirigiendo...</p>
    </div>
  </div>
{/if}
