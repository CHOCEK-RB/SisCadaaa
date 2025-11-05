<script lang="ts">
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import type { LayoutData } from "./$types";

  import { page } from "$app/stores";

  import InfoIcon from "@lucide/svelte/icons/info";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
  import UserRoundIcon from "@lucide/svelte/icons/user-round";
  let { data } = $props<{ data: LayoutData }>();
  const { courseDetails } = data;
  const academicCourseId = $page.params.academicCourseId;

  let nuevos = [
    {
      title: "Información",
      href: `/student/courses/${academicCourseId}`,
      icon: InfoIcon,
    },
    {
      title: "Horario",
      href: `/student/courses/${academicCourseId}/schedule`,
      icon: CalendarIcon,
    },
    {
      href: `/student/courses/${academicCourseId}/grades`,
      title: "Mis Notas",
      icon: CircleCheckIcon,
    },
    {
      href: `/student/courses/${academicCourseId}/attendance`,
      title: "Asistencia",
      icon: UserRoundIcon,
    },
  ];
</script>

<div class="container mx-auto ml-4 px-4 py-6">
  <div class="mb-6 border-b pb-4">
    <h1 class="text-3xl font-bold text-gray-800">
      {courseDetails?.course?.name || "Cargando..."}
    </h1>
    <p class="text-lg text-gray-600">
      {courseDetails?.course?.code} - {new Date(
        courseDetails?.creationDate,
      ).getFullYear()}
    </p>
    {#if courseDetails?.coordinator}
      <p class="mt-1 text-sm text-gray-500">
        Coordinador: {courseDetails.coordinator.firstName}
        {courseDetails.coordinator.lastName}
      </p>
    {/if}
  </div>

  <NavigationMenu.Root
    viewport={false}
    class="relative z-10 flex w-full justify-center"
  >
    <NavigationMenu.List
      class="group flex list-none items-center justify-center p-1"
    >
      {#each nuevos as item (item.href)}
        {@const isActive = $page.url.pathname === item.href}
        <NavigationMenu.Item class="flex pr-2 pl-2">
          <NavigationMenu.Link
            href={item.href}
            class="inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150"
            active={isActive}
          >
            <item.icon class="h-2 w-2 shrink-0" />
            <span>{item.title}</span>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      {/each}
    </NavigationMenu.List>
  </NavigationMenu.Root>
  <slot />
</div>
