<script lang="ts">
  import type { PageData } from "./$types";
  import { AlertCircle, Calendar, Download } from "lucide-svelte";
  import * as Card from "$lib/components/ui/card";
  import ScheduleTable from "$lib/components/ScheduleTable.svelte";
  import { Button } from "$lib/components/ui/button";
  import type { AcademicGroupDTO } from "$lib/types/group.types";
  import type { CourseDTO } from "$lib/types/course.types";
  import { SvelteMap } from "svelte/reactivity";

  type CourseSummaryItem = {
    course: CourseDTO;
    groups: AcademicGroupDTO[];
  };

  let { data } = $props<{ data: PageData }>();
  const allScheduleGroups = $derived(data.allScheduleGroups);
  const error = data.error;

  const coursesSummary = $derived(() => {
    if (!allScheduleGroups) return [];
    const coursesMap = new SvelteMap<string, CourseSummaryItem>();
    allScheduleGroups.forEach((group: AcademicGroupDTO) => {
      if (group.course?.course) {
        const courseId = group.course.course.id;
        if (!coursesMap.has(courseId)) {
          coursesMap.set(courseId, {
            course: group.course.course,
            groups: [],
          });
        }
        coursesMap.get(courseId)!.groups.push(group);
      }
    });
    return Array.from(coursesMap.values()).sort((a, b) =>
      a.course.name.localeCompare(b.course.name),
    );
  });

  function handlePrint() {
    window.print();
  }
</script>

<svelte:head>
  <title>Mi Horario - Sisacad</title>
</svelte:head>

<div class="container mx-auto space-y-8 px-4 py-8">
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold">Mi Horario</h1>
    <Button onclick={handlePrint} class="print:hidden">
      <Download class="mr-2 h-4 w-4" />
      Imprimir
    </Button>
  </div>

  {#if error}
    <div
      class="text-destructive-foreground flex items-center rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm"
      role="alert"
    >
      <AlertCircle class="mr-3 h-5 w-5 flex-shrink-0" />
      <div>
        <span class="font-medium">Error:</span>
        {error}
      </div>
    </div>
  {:else if allScheduleGroups && allScheduleGroups.length > 0}
    <div>
      <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold">
        <Calendar class="h-6 w-6" />
        Resumen de Cursos
      </h2>
      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {#each coursesSummary() as { course, groups } (course.id)}
          <Card.Root>
            <Card.Header>
              <Card.Title class="truncate">{course.name}</Card.Title>
              <Card.Description>{course.code}</Card.Description>
            </Card.Header>
            <Card.Content>
              <div class="space-y-1">
                {#each groups as group (group.id)}
                  <p class="text-sm text-muted-foreground">
                    &bull; Grupo: {group.name} ({group.type})
                  </p>
                {/each}
              </div>
            </Card.Content>
          </Card.Root>
        {/each}
      </div>
    </div>

    <div class="print:shadow-none">
      <h2 class="mb-4 text-2xl font-semibold">Horario Semanal Completo</h2>
      <!-- Placeholder for the new ScheduleTable component -->
      <ScheduleTable groups={allScheduleGroups} showCourseName={true} />
    </div>
  {:else}
    <Card.Root class="text-center">
      <Card.Content class="p-6">
        <Calendar class="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <p class="text-lg text-foreground">
          No tienes horarios registrados actualmente.
        </p>
        <p class="mt-2 text-sm text-muted-foreground">
          Los horarios aparecerán aquí una vez que estés matriculado en cursos.
        </p>
      </Card.Content>
    </Card.Root>
  {/if}
</div>
