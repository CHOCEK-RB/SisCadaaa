<script lang="ts">
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import InfoIcon from "@lucide/svelte/icons/info";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import SquareCheckIcon from "@lucide/svelte/icons/square-check";
  import UsersIcon from "@lucide/svelte/icons/users";
  import type { LayoutData } from "./$types";

  type Props = {
    data: LayoutData;
    children: Snippet;
  };

  let { data, children }: Props = $props();

  const groupInfo = $derived(data.groupInfo);

  const groupName = $derived(groupInfo?.name ?? "Cargando...");
  const courseName = $derived(groupInfo?.course?.course?.name ?? "");
  const courseCode = $derived(groupInfo?.course?.course?.code ?? "");
  const year = $derived(
    groupInfo?.course?.creationDate
      ? new Date(groupInfo.course.creationDate).getFullYear()
      : "",
  );

  const navLinks = $derived([
    {
      title: "Información",
      href: `/secretary/groups/${page.params.id}`,
      icon: InfoIcon,
    },
    {
      title: "Horario",
      href: `/secretary/groups/${page.params.id}/schedule`,
      icon: CalendarIcon,
    },
    {
      title: "Notas",
      href: `/secretary/groups/${page.params.id}/grades`,
      icon: SquareCheckIcon,
    },
    {
      title: "Asistencia",
      href: `/secretary/groups/${page.params.id}/attendance`,
      icon: UsersIcon,
    },
  ]);
</script>

<div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
  <div class="mb-6 border-b pb-4">
    <h1 class="text-3xl font-bold text-foreground">
      {courseName} - Grupo {groupName}
    </h1>
    <p class="text-lg text-muted-foreground">
      {courseCode} - {year}
    </p>
    {#if groupInfo?.teacher}
      <p class="mt-1 text-sm text-muted-foreground">
        Docente: {groupInfo?.teacher.firstName}
        {groupInfo?.teacher.lastName}
      </p>
    {/if}
  </div>

  <NavigationMenu.Root class="mb-6">
    <NavigationMenu.List>
      {#each navLinks as item (item.href)}
        {@const isActive = page.url.pathname === item.href}
        <NavigationMenu.Item>
          <NavigationMenu.Link
            href={item.href}
            active={isActive}
            class="flex items-center gap-2 p-3 pr-4 pl-4 md:pr-16 md:pl-16"
          >
            <item.icon class="h-5 w-5 shrink-0" />
            <span class="hidden md:inline">{item.title}</span>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      {/each}
    </NavigationMenu.List>
  </NavigationMenu.Root>

  {@render children()}
</div>
