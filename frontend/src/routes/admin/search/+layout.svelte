<script lang="ts">
  import SearchNavbar from "$lib/components/navbar/secretaries/SearchNavbarAdmin.svelte";
  import { page } from "$app/state";
</script>

<div class="p-4">
  <SearchNavbar url={page.url} />
  <slot />
</div>
