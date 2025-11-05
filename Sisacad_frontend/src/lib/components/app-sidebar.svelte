<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar";
  import SunIcon from "@lucide/svelte/icons/sun";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import LogoIcon from "@lucide/svelte/icons/book-open-text";
  import LogOutIcon from "@lucide/svelte/icons/log-out";
  import { toggleMode } from "mode-watcher";
  import { Button } from "$lib/components/ui/button/index.js";
  import { authStore, currentUser } from "$lib/store/auth.store";
  import type { ComponentProps } from "svelte";

  import { navigationLinks, type NavLink } from "$lib/config/navigation";
  let {
    ref = $bindable(null),
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> = $props();

  function handleLogout() {
    authStore.logout();
  }
  const items: NavLink[] = $derived(navigationLinks[$currentUser!.role]);
</script>

<Sidebar.Root class="border-r bg-white" {...restProps}>
  <Sidebar.Header class="border-b p-4">
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton
          class="w-full text-lg font-semibold"
          variant="default"
          style="--spacing: 0.4rem;"
        >
          <a href="/" class="flex h-max w-full gap-3">
            <div
              class="ml-1 flex items-center justify-center rounded-md bg-blue-500 p-1 text-white"
            >
              <LogoIcon class="h-5 w-5" />
            </div>
            <span class="m-1 ml-2 text-3xl font-bold">Sisacad</span>
          </a>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>

  <Sidebar.Content class="p-4">
    <Sidebar.Group>
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <a
            href="/"
            class="flex w-full items-center gap-3 rounded-md p-3 text-left"
          >
            <div
              class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100"
            >
              <span class="text-lg font-semibold text-blue-600">
                {$currentUser!.firstName.charAt(
                  0,
                )}{$currentUser!.lastName.charAt(0)}
              </span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-medium">
                {$currentUser?.firstName}
                {$currentUser?.lastName}
              </div>
              <div class="truncate text-xs text-muted-foreground">
                {$currentUser?.email}
              </div>
            </div>
          </a>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Group>

    <Sidebar.Group style="--spacing: 0.4rem;">
      <Sidebar.GroupContent>
        <Sidebar.Menu class="space-y-2">
          {#each items as item (item.title)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton>
                {#snippet child({ props })}
                  <a href={item.url} {...props}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Footer>
    <Sidebar.Menu
      class="flex flex-row items-center justify-between border-t p-4"
    >
      <Button onclick={() => toggleMode()} variant="outline" size="icon">
        <SunIcon
          class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
        />
        <MoonIcon
          class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>

      <Sidebar.MenuItem>
        <Sidebar.MenuButton class="items-center justify-between p-4">
          <button onclick={handleLogout} class="flex items-center gap-2">
            <LogOutIcon class="h-4 w-4" />
            <span class="text-sm font-medium">Log Out</span>
          </button>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Footer>
</Sidebar.Root>
