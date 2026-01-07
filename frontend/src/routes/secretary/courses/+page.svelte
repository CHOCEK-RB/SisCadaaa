<script lang="ts">
  import { academicCourseService } from "$lib/services/academic_course.service";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import type { GlobalEvent } from "$lib/types/event.types";

  const { data } = $props();

  let periods = $state(data.periods);
  let courses = $state(data.courses);
  let error = $state(data.error);
  let isLoading = $state(false);
  let selectedPeriodId = $state(data.selectedPeriodId);

  const triggerContent = $derived(
    periods.find((p: GlobalEvent) => p.id === selectedPeriodId)?.name ||
      "Seleccionar período",
  );

  const coursesBySemester = $derived(() => {
    if (!courses) return new Map();
    const grouped = courses.reduce((acc, course) => {
      const semester = course.course.semester;
      if (!acc.has(semester)) {
        acc.set(semester, []);
      }
      acc.get(semester)?.push(course);
      return acc;
    }, new Map<number, (typeof courses)[0][]>());

    return new Map([...grouped.entries()].sort((a, b) => a[0] - b[0]));
  });

  $effect(() => {
    if (!selectedPeriodId) {
      courses = [];
      return;
    }

    isLoading = true;
    academicCourseService
      .getCoursesByPeriod(selectedPeriodId)
      .then((newCourses) => {
        courses = newCourses;
      })
      .catch((err) => {
        error =
          err instanceof Error ? err.message : "An unknown error occurred.";
        courses = [];
      })
      .finally(() => {
        isLoading = false;
      });
  });
</script>

<div class="container mx-auto p-4 md:p-8">
  <div
    class="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center"
  >
    <h1 class="mb-4 text-2xl font-bold md:mb-0">Cursos Académicos</h1>
    {#if periods.length > 0}
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">Período:</span>
        <Select.Root type="single" bind:value={selectedPeriodId}>
          <Select.Trigger class="w-[200px]">
            {triggerContent}
          </Select.Trigger>
          <Select.Content>
            {#each periods as period (period.id)}
              <Select.Item value={period.id} label={period.name}>
                {period.name}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    {/if}
  </div>

  {#if error}
    <div class="rounded-md bg-red-100 p-4 text-red-500">{error}</div>
  {:else if periods.length === 0}
    <p>No se encontraron períodos académicos.</p>
  {:else if isLoading}
    <div
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {#each Array(8) as _, i (i)}
        <Card.Root>
          <Card.Header>
            <Skeleton class="mb-2 h-5 w-3/4" />
            <Skeleton class="h-4 w-1/2" />
          </Card.Header>
          <Card.Content>
            <Skeleton class="mb-1 h-4 w-full" />
            <Skeleton class="h-4 w-full" />
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {:else if courses.length > 0}
    {#each Array.from(coursesBySemester().entries()) as [semester, semesterCourses] (semester)}
      <div class="mb-8">
        <h2 class="mb-4 border-b pb-2 text-xl font-semibold">
          Semestre {semester}
        </h2>
        <div
          class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {#each semesterCourses as academicCourse (academicCourse.id)}
            <a
              href={`/secretary/courses/${academicCourse.id}`}
              class="block h-full transition-shadow duration-200 hover:shadow-lg"
            >
              <Card.Root class="h-full hover:scale-[1.05] hover:bg-secondary">
                <Card.Header>
                  <Card.Title>{academicCourse.course.name}</Card.Title>
                  <Card.Description
                    >{academicCourse.course.code}</Card.Description
                  >
                </Card.Header>
                <Card.Content class="text-sm text-gray-600">
                  <p>
                    <strong>Semestre:</strong>
                    {academicCourse.course.semester}
                  </p>
                  <p>
                    <strong>Créditos:</strong>
                    {academicCourse.course.credits}
                  </p>
                </Card.Content>
              </Card.Root>
            </a>
          {/each}
        </div>
      </div>
    {/each}
  {:else}
    <p>No hay cursos disponibles para el período seleccionado.</p>
  {/if}
</div>
