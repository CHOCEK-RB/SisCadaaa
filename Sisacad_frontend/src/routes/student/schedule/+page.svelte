<script lang="ts">
  import type { PageData } from './$types';
  import { SvelteMap } from 'svelte/reactivity';
  import { AlertCircle, Calendar, Download } from 'lucide-svelte';
  import ScheduleGrid from '$lib/components/ScheduleGrid.svelte';
  import type { AcademicGroupDTO } from '$lib/types/group.types';
  import type { CourseDTO } from '$lib/types/course.types';

  type CourseSummaryItem = {
    course: CourseDTO;
    groups: AcademicGroupDTO[];
  };

  const { data } = $props<{ data: PageData }>();
  const allScheduleGroups = $derived(data.allScheduleGroups);
  const error = data.error;

  const coursesSummary = $derived((): CourseSummaryItem[] => {
    const coursesMap = new SvelteMap<string, CourseSummaryItem>();
    allScheduleGroups.forEach((group: AcademicGroupDTO) => {
      if (group.course?.course) {
        const courseId = group.course.id;
        if (!coursesMap.has(courseId)) {
          coursesMap.set(courseId, {
            course: group.course.course,
            groups: [],
          });
        }
        coursesMap.get(courseId)!.groups.push(group);
      }
    });
    return Array.from(coursesMap.values());
  });

  function handlePrint() {
    window.print();
  }
</script>

<svelte:head>
  <title>Mi Horario - Sisacad</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold text-gray-800">Mi Horario</h1>
    <button
      onclick={handlePrint}
      class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors print:hidden"
    >
      <Download class="w-4 h-4" />
      Imprimir
    </button>
  </div>

  {#if error}
    <div
      class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200"
      role="alert"
    >
      <AlertCircle class="w-5 h-5 mr-3 flex-shrink-0" />
      <div>
        <span class="font-medium">Error:</span>
        {error}
      </div>
    </div>
  {:else if allScheduleGroups && allScheduleGroups.length > 0}
    <div
      class="bg-white p-6 rounded-lg shadow-md border mb-6 print:break-inside-avoid"
    >
      <h2
        class="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2"
      >
        <Calendar class="w-5 h-5" />
        Resumen de Cursos
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each coursesSummary() as { course, groups } (course.id)}
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p class="font-bold text-gray-800 mb-2">{course.name}</p>
            <p class="text-sm text-gray-600 mb-2">{course.code}</p>
            <div class="space-y-1">
              {#each groups as group (group.id)}
                <p class="text-xs text-gray-500">
                  • {group.name} ({group.type})
                </p>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md border print:shadow-none">
      <h2 class="text-xl font-semibold mb-6 text-gray-700">
        Horario Semanal Completo
      </h2>
      <ScheduleGrid groups={allScheduleGroups} showCourseName={true} />
    </div>
  {:else}
    <div class="bg-white p-6 rounded-lg shadow-md border text-center">
      <Calendar class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <p class="text-gray-600 text-lg">
        No tienes horarios registrados actualmente.
      </p>
      <p class="text-gray-500 text-sm mt-2">
        Los horarios aparecerán aquí una vez que estés matriculado en cursos.
      </p>
    </div>
  {/if}
</div>
