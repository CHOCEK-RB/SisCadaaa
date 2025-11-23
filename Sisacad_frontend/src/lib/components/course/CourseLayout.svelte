<script lang="ts">
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import type { Snippet } from "svelte";
  import type { AcademicCourseDTO } from "$lib/types/course.types";
  import { page } from "$app/state";

  import InfoIcon from "@lucide/svelte/icons/info";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
  import UserRoundIcon from "@lucide/svelte/icons/user-round";

  type Props = {
    courseDetails: AcademicCourseDTO | null;
    children: Snippet;
  };

  let { courseDetails, children }: Props = $props();

  const year = new Date(courseDetails!.creationDate.toString()).getFullYear();

  const academicCourseId = $derived(page.params.academicCourseId);

  const navLinks = $derived([
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
      title: "Mis Notas",
      href: `/student/courses/${academicCourseId}/grades`,
      icon: CircleCheckIcon,
    },
    {
      title: "Asistencia",
      href: `/student/courses/${academicCourseId}/attendance`,
      icon: UserRoundIcon,
    },
  ]);
</script>

<div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
  <div class="mb-6 border-b pb-4">
    <h1 class="text-3xl font-bold text-foreground">
      {courseDetails?.course?.name ?? "Cargando..."}
    </h1>
    <p class="text-lg text-muted-foreground">
      {courseDetails?.course?.code} - {year}
    </p>
    {#if courseDetails?.coordinator}
      <p class="mt-1 text-sm text-muted-foreground">
        Coordinador: {courseDetails.coordinator.firstName}
        {courseDetails.coordinator.lastName}
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
            class="flex items-center gap-2 p-3 pr-16 pl-16"
          >
            <item.icon class="h-10 w-10 shrink-0" />
            <span>{item.title}</span>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      {/each}
    </NavigationMenu.List>
  </NavigationMenu.Root>

  {@render children()}
</div>
