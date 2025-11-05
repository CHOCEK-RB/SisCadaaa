<script lang="ts">
  import type { LayoutData } from "./$types";
  import { page } from "$app/state";
  import { Info, Calendar, SquareCheck, Users } from "lucide-svelte";

  let { data } = $props<{ data: LayoutData }>();
  const { courseDetails } = data;
  const academicCourseId = page.params.academicCourseId;

  interface Tab {
    href: string;
    label: string;
    icon: typeof Info;
  }

  const tabs: Tab[] = [
    {
      href: `/teacher/courses/${academicCourseId}`,
      label: "Información",
      icon: Info,
    },
    {
      href: `/teacher/courses/${academicCourseId}/schedule`,
      label: "Horario",
      icon: Calendar,
    },
    {
      href: `/teacher/courses/${academicCourseId}/grades`,
      label: "Notas",
      icon: SquareCheck,
    },
    {
      href: `/teacher/courses/${academicCourseId}/attendance`,
      label: "Asistencia",
      icon: Users,
    },
  ];

  const activePath = $derived(page.url.pathname);
</script>

<div class="container mx-auto px-4 py-6">
  <div class="mb-6 border-b pb-4">
    <h1 class="text-3xl font-bold text-gray-800">
      {courseDetails?.course?.name || "Cargando..."}
    </h1>
    <p class="text-lg text-gray-600">
      {courseDetails?.course?.code} - {new Date(
        courseDetails?.creationDate,
      ).getFullYear()}
    </p>
  </div>

  <nav class="mb-8">
    <ul class="-mb-px flex space-x-1 border-b">
      {#each tabs as tab (tab.href)}
        {@const Icon = tab.icon}
        {@const isActive =
          activePath === tab.href ||
          (tab.href === `/courses/${academicCourseId}` &&
            activePath === `${tab.href}/`)}
        <li>
          <a
            href={tab.href}
            class="inline-flex items-center border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150"
            class:border-blue-600={isActive}
            class:text-blue-600={isActive}
            class:border-transparent={!isActive}
            class:text-gray-500={!isActive}
            class:hover:text-gray-700={!isActive}
            class:hover:border-gray-300={!isActive}
          >
            <Icon class="mr-2 h-4 w-4" />
            {tab.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <slot />
</div>
