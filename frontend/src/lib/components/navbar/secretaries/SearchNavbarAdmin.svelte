<script lang="ts">
  import { adminSearchNavItems, type NavItem } from "$lib/config/nav";
  import { Button } from "$lib/components/ui/button/index.js";

  export let url: URL;

  const navItems: NavItem[] = adminSearchNavItems;
</script>

<nav class="mb-4">
  <div class="border-b">
    <div class="flex h-16 items-center px-4">
      <div class="flex flex-wrap items-center space-x-4">
        {#each navItems as item (item.href)}
          <a href={item.href}>
            <Button
              variant={url.pathname.startsWith(item.href) ? "default" : "ghost"}
              class="justify-start"
            >
              <svelte:component this={item.icon} class="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          </a>
        {/each}
      </div>
    </div>
  </div>
</nav>
