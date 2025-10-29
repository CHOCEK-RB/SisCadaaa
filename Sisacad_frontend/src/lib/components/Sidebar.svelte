<script lang="ts">
  import { page } from '$app/state';
  import {
    navigationLinks,
    logoutLink,
    type NavLink,
    type UserRole,
  } from '$lib/config/navigation';
  import { LogOut } from 'lucide-svelte';
  import defaultAvatar from '$lib/assets/default_avatar.webp';

  let { userRole, userEmail, userIconUrl, onLogout } = $props<{
    userRole: UserRole;
    userEmail: string;
    userIconUrl: string | undefined | null;
    onLogout: () => void;
  }>();

  const links: NavLink[] = $derived(navigationLinks[userRole as UserRole]);

  const currentPath = $derived(page.url.pathname);

  function handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.onerror = null;
    imgElement.src = defaultAvatar;
  }
</script>

<aside
  class="w-64 bg-indigo-800 text-indigo-100 flex flex-col min-h-screen shadow-lg"
>
  <div
    class="p-4 border-b border-indigo-700 flex flex-col items-center text-center"
  >
    <img
      src={userIconUrl || defaultAvatar}
      alt="User Avatar"
      class="w-16 h-16 rounded-full mb-3 border-2 border-indigo-400 object-cover"
      onerror={handleImageError}
    />
    <span class="text-sm font-medium truncate max-w-full">{userEmail}</span>
    <span class="text-xs text-indigo-300 capitalize">{userRole}</span>
  </div>

  <nav class="flex-1 px-2 py-4 space-y-1">
    {#each links as link (link.href)}
      {@const Icon = link.icon}
      <a
        href={link.href}
        class="flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out group"
        class:bg-indigo-700={currentPath === link.href ||
          (link.href !== '/home' && currentPath.startsWith(link.href))}
        class:text-white={currentPath === link.href ||
          (link.href !== '/home' && currentPath.startsWith(link.href))}
        class:hover:bg-indigo-700={!(
          currentPath === link.href ||
          (link.href !== '/home' && currentPath.startsWith(link.href))
        )}
        class:hover:text-white={!(
          currentPath === link.href ||
          (link.href !== '/home' && currentPath.startsWith(link.href))
        )}
      >
        <Icon class="mr-3 flex-shrink-0 h-5 w-5" />
        {link.label}
      </a>
    {/each}
  </nav>

  <div class="px-2 py-4 border-t border-indigo-700">
    <button
      onclick={onLogout}
      class="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-indigo-200 hover:bg-red-600 hover:text-white transition-colors duration-150 ease-in-out group"
    >
      <LogOut class="mr-3 flex-shrink-0 h-5 w-5" />
      {logoutLink.label}
    </button>
  </div>
</aside>
