<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { ArrowDownToLine } from "lucide-svelte";
  import type { AcademicCourseDTO } from "$lib/types/course.types";
  import CreateAcademicGroupForm from "./CreateAcademicGroupForm.svelte"; // Added import

  const { data } = $props<{ course: AcademicCourseDTO }>();

  let course = $state<AcademicCourseDTO>(data.course);
  let error = $state(data.error);

  const coordinatorFullName = $derived(() => {
    if (!course?.coordinator) return "No asignado";
    const { firstName, lastName } = course.coordinator;
    return `${firstName} ${lastName}`;
  });

  const sortedGroups = $derived(() => {
    return (
      course?.groups?.slice().sort((a, b) => a.name.localeCompare(b.name)) || []
    );
  });

  $effect(() => {
    course = data.course;
    error = data.error;
  });
</script>

<div class="container mx-auto p-4 md:p-8">
  {#if error}
    <div class="rounded-md bg-red-100 p-4 text-red-500">{error}</div>
  {:else if course}
    <div
      class="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center"
    >
      <h1 class="mb-4 text-3xl font-bold md:mb-0">{course.course.name}</h1>
      {#if course.urlSyllabus}
        <a href={course.urlSyllabus} download target="_blank">
          <Button>
            <ArrowDownToLine class="mr-2 h-4 w-4" />
            Descargar Sílabo
          </Button>
        </a>
      {:else}
        <Card.Root class="flex items-center justify-center p-4 text-center">
          <p class="text-muted-foreground">
            No hay sílabo subido para este curso.
          </p>
        </Card.Root>
      {/if}
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <Card.Root>
          <Card.Header>
            <Card.Title>Detalles del Curso</Card.Title>
          </Card.Header>
          <Card.Content class="text-base">
            <p><strong>Semestre:</strong> {course.course.semester}</p>
            <p>
              <strong>Período Académico:</strong>
              {course.academicPeriod?.name || "No especificado"}
            </p>
            <p><strong>Profesor a Cargo:</strong> {coordinatorFullName()}</p>
          </Card.Content>
        </Card.Root>

        <Card.Root class="mt-6">
          <Card.Header>
            <Card.Title>Contenido del Curso</Card.Title>
          </Card.Header>
          <Card.Content>
            <ol class="space-y-3 text-lg">
              {#each course.topics || [] as topic, i (topic.id)}
                <li class="flex items-center gap-x-3">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
                  >
                    {i + 1}
                  </span>
                  <span class="font-medium">{topic.topic}</span>
                </li>
              {/each}
            </ol>
          </Card.Content>
        </Card.Root>
      </div>

      <div>
        <Card.Root>
          <Card.Header>
            <Card.Title>Grupos Académicos</Card.Title>
            <Card.Description>
              Grupos disponibles para este curso.
            </Card.Description>
          </Card.Header>
          <Card.Content class="space-y-3">
            <CreateAcademicGroupForm academicCourse={course} />
            {#each sortedGroups() as group (group.id)}
              <a href={`/secretary/groups/${group.id}`} class="block">
                <Card.Root
                  class="transition-all duration-200 hover:scale-[1.05] hover:bg-secondary"
                >
                  <Card.Header class="p-4">
                    <Card.Title class="text-lg">Grupo {group.name}</Card.Title>
                    <Card.Description>{group.type}</Card.Description>
                  </Card.Header>
                </Card.Root>
              </a>
            {:else}
              <p>No hay grupos asignados a este curso.</p>
            {/each}
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  {:else}
    <p>Cargando detalles del curso...</p>
  {/if}
</div>
