<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { userRole } from "$lib/store/auth.store";
  import { GraduationCap, Calendar, ListChecks } from "lucide-svelte";
  import {type NavAccess, type UserRole, NavigationsAccess} from "$lib/config/access_direct"
  const currentRole = $derived($userRole as UserRole);
  const links: NavAccess[] = $derived(NavigationsAccess[currentRole]);
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
  {#each links as link (link.url)}
    {@const Icon = link.icon}
    <a href={link.url} class="no-underline">
      <Button variant="outline" class="h-24 w-full justify-start p-4 text-left">
        <div class="flex items-center gap-4">
          <Icon class="h-8 w-8 text-primary" />
          <div>
            <h3 class="font-semibold">{link.title}</h3>
            <p class="text-sm text-muted-foreground">{link.description}</p>
          </div>
        </div>
      </Button>
    </a>
  {/each}
</div>