<script lang="ts">
  import type { PageData } from "./$types";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import TopicsList from "$lib/components/course/TopicsList.svelte";
  import CourseProgressBar from "$lib/components/course/CourseProgressBar.svelte";
  import type { StudentUserDTO } from "$lib/types/user.types";
  import type { CourseTopicDTO } from "$lib/types/course.types";
  import type { AcademicGroupDTO } from "$lib/types/group.types";

  import StudentDataTable from "$lib/components/tables/secretary/groups/StudentDataTable.svelte";
  import { goto } from "$app/navigation";

  let { data } = $props<{ data: PageData }>();

  let groupDetails = $derived<AcademicGroupDTO>(data.groupInfo);
  let students = $derived(data.students as StudentUserDTO[]);

  const groupProgress = $derived(
    groupDetails?.course?.progress?.find(
      (p) => p.groupName === groupDetails?.name,
    ),
  );

  const completedTopicIds = $derived<Set<string>>(
    new Set(
      groupProgress?.completedTopics.map((t: CourseTopicDTO) => t.id) ?? [],
    ),
  );

  const sortedTopics = $derived(
    [...(groupDetails?.course?.topics ?? [])].sort((a, b) => a.order - b.order),
  );

  const percentage = $derived(
    sortedTopics.length > 0
      ? (completedTopicIds.size / sortedTopics.length) * 100
      : 0,
  );

  function handleRowClick(student: StudentUserDTO) {
    goto(`/secretary/students/${student.id}`);
  }
</script>

<svelte:head>
  <title>Información de Grupo - Sisacad</title>
</svelte:head>

<div class="space-y-6">
  <Card.Root>
    <Card.Header>
      <Card.Title>Información del Grupo</Card.Title>
    </Card.Header>
    <Card.Content class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1">
        <p class="font-semibold">Docente</p>
        <p class="text-muted-foreground">
          {groupDetails?.teacher?.firstName}
          {groupDetails?.teacher?.lastName}
        </p>
      </div>
      <div class="space-y-1">
        <p class="font-semibold">Tipo de Grupo</p>
        <p>
          <Badge variant="outline">{groupDetails?.type}</Badge>
        </p>
      </div>
      <div class="space-y-1">
        <p class="font-semibold">Capacidad</p>
        <p class="text-muted-foreground">
          {groupDetails?.capacity ?? "No especificada"}
        </p>
      </div>
      <div class="space-y-1">
        <p class="font-semibold">Alumnos Inscritos</p>
        <p class="text-muted-foreground">{students.length}</p>
      </div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Avance de Temas</Card.Title>
    </Card.Header>
    <Card.Content>
      {#if sortedTopics.length > 0}
        <div class="my-4">
          <CourseProgressBar {percentage} />
        </div>
        <TopicsList topics={sortedTopics} {completedTopicIds} />
      {:else}
        <p class="text-muted-foreground">
          No hay temas definidos para este curso.
        </p>
      {/if}
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Alumnos Matriculados</Card.Title>
    </Card.Header>
    <Card.Content>
      <StudentDataTable data={students} onRowClick={handleRowClick} />
    </Card.Content>
  </Card.Root>
</div>
