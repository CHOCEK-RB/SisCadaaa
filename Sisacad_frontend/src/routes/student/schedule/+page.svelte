<script lang="ts">
  import type { PageData } from "./$types";
  import { SvelteMap } from "svelte/reactivity";
  import { AlertCircle, Calendar, Download } from "lucide-svelte";
  import ScheduleGrid from "$lib/components/ScheduleGrid.svelte";
  import type { AcademicGroupDTO } from "$lib/types/group.types";
  import type { CourseDTO } from "$lib/types/course.types";

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
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-3xl font-bold text-gray-800">Mi Horario</h1>
    <button
      onclick={handlePrint}
      class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 print:hidden"
    >
      <Download class="h-4 w-4" />
      Imprimir
    </button>
  </div>

  {#if error}
    <div
      class="mb-4 flex items-center rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      role="alert"
    >
      <AlertCircle class="mr-3 h-5 w-5 flex-shrink-0" />
      <div>
        <span class="font-medium">Error:</span>
        {error}
      </div>
    </div>
  {:else if allScheduleGroups && allScheduleGroups.length > 0}
    <div
      class="mb-6 rounded-lg border bg-white p-6 shadow-md print:break-inside-avoid"
    >
      <h2
        class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-700"
      >
        <Calendar class="h-5 w-5" />
        Resumen de Cursos
      </h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each coursesSummary() as { course, groups } (course.id)}
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p class="mb-2 font-bold text-gray-800">{course.name}</p>
            <p class="mb-2 text-sm text-gray-600">{course.code}</p>
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

    <div class="rounded-lg border bg-white p-6 shadow-md print:shadow-none">
      <h2 class="mb-6 text-xl font-semibold text-gray-700">
        Horario Semanal Completo
      </h2>
      <ScheduleGrid groups={allScheduleGroups} showCourseName={true} />
    </div>
  {:else}
    <div class="rounded-lg border bg-white p-6 text-center shadow-md">
      <Calendar class="mx-auto mb-4 h-16 w-16 text-gray-400" />
      <p class="text-lg text-gray-600">
        No tienes horarios registrados actualmente.
      </p>
      <p class="mt-2 text-sm text-gray-500">
        Los horarios aparecerán aquí una vez que estés matriculado en cursos.
      </p>
    </div>
  {/if}
</div>
