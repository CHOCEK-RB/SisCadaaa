<script lang="ts">
  import type { LayoutData } from './$types';
  import { page } from '$app/state';
  import {
    Info,
    BookText,
    Calendar,
    SquareCheck,
    SquarePen,
    Users,
  } from 'lucide-svelte';

  let { data } = $props<{ data: LayoutData }>();
  const { userRole, courseDetails } = data;
  const academicCourseId = page.params.academicCourseId;

  interface Tab {
    href: string;
    label: string;
    icon: typeof Info;
    roles: ('student' | 'teacher' | 'admin' | 'secretary')[];
  }

  const allTabs: Tab[] = [
    {
      href: `/courses/${academicCourseId}`,
      label: 'Información',
      icon: Info,
      roles: ['student', 'teacher', 'admin', 'secretary'],
    },
    {
      href: `/courses/${academicCourseId}/topics`,
      label: 'Temas',
      icon: BookText,
      roles: ['student', 'teacher', 'admin', 'secretary'],
    },
    {
      href: `/courses/${academicCourseId}/schedule`,
      label: 'Horario',
      icon: Calendar,
      roles: ['student', 'teacher'],
    },
    {
      href: `/courses/${academicCourseId}/grades`,
      label: 'Mis Notas',
      icon: SquareCheck,
      roles: ['student'],
    },
    {
      href: `/courses/${academicCourseId}/attendance`,
      label: 'Asistencia',
      icon: Users,
      roles: ['student', 'teacher'],
    },
    {
      href: `/courses/${academicCourseId}/manage-grades`,
      label: 'Gestionar Notas',
      icon: SquarePen,
      roles: ['teacher'],
    },
  ];

  const visibleTabs = $derived(
    allTabs.filter((tab) => tab.roles.includes(userRole)),
  );

  const activePath = $derived(page.url.pathname);
</script>

<div class="container mx-auto px-4 py-6">
  <div class="mb-6 pb-4 border-b">
    <h1 class="text-3xl font-bold text-gray-800">
      {courseDetails?.course?.name || 'Cargando...'}
    </h1>
    <p class="text-gray-600 text-lg">
      {courseDetails?.course?.code} - {new Date(
        courseDetails?.creationDate,
      ).getFullYear()}
    </p>
    {#if courseDetails?.coordinator}
      <p class="text-sm text-gray-500 mt-1">
        Coordinador: {courseDetails.coordinator.firstName}
        {courseDetails.coordinator.lastName}
      </p>
    {/if}
  </div>

  <nav class="mb-8">
    <ul class="flex border-b space-x-1 -mb-px">
      {#each visibleTabs as tab (tab.href)}
        {@const Icon = tab.icon}
        {@const isActive =
          activePath === tab.href ||
          (tab.href === `/courses/${academicCourseId}` &&
            activePath === `${tab.href}/`)}
        <li>
          <a
            href={tab.href}
            class="inline-flex items-center px-4 py-2.5 border-b-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap"
            class:border-blue-600={isActive}
            class:text-blue-600={isActive}
            class:border-transparent={!isActive}
            class:text-gray-500={!isActive}
            class:hover:text-gray-700={!isActive}
            class:hover:border-gray-300={!isActive}
          >
            <Icon class="w-4 h-4 mr-2" />
            {tab.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <slot />
</div>
