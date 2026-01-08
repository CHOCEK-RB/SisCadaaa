<script lang="ts">
  import type { PageData } from "./$types";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import TopicsList from "$lib/components/course/TopicsList.svelte";
  import CourseProgressBar from "$lib/components/course/CourseProgressBar.svelte";
  import type { StudentUserDTO, TeacherDTO } from "$lib/types/user.types";
  import type { CourseTopicDTO } from "$lib/types/course.types";
  import {
    AcademicGroupType,
    type AcademicGroupDTO,
  } from "$lib/types/group.types";
  import { groupsService } from "$lib/services/groups.service";
  import { toast } from "svelte-sonner";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Pencil, Plus } from "lucide-svelte";
  import * as Select from "$lib/components/ui/select";
  import * as Label from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { goto, invalidateAll } from "$app/navigation";
  import { cn } from "$lib/utils";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import StudentDataTable from "$lib/components/tables/secretary/groups/StudentDataTable.svelte"; // Corrected import
  import TeacherSelectorDialog from "$lib/components/TeacherSelectorDialog.svelte"; // Import TeacherSelectorDialog

  let { data } = $props<{ data: PageData }>();

  let groupDetails = $derived<AcademicGroupDTO>(data.groupInfo);
  let students = $derived(data.students as StudentUserDTO[]);
  let teachers = $derived(data.teachers as TeacherDTO[]);

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

  let showEditGroupDialog = $state(false);
  let editingGroupData = $state<{
    name?: string;
    capacity?: number;
    teacherId?: string | null;
    type?: AcademicGroupType;
  }>({});
  let selectedTeacherId = $state<string | undefined | null>(undefined);
  let isTeacherSelectionDialogOpened = $state(false); // New state for teacher selection dialog

  // Helper to get selected teacher's full name for display
  const getTeacherName = $derived(() => {
    if (selectedTeacherId === null) return "Sin Docente Asignado";
    const teacher = teachers.find((t) => t.id === selectedTeacherId);
    return teacher
      ? `${teacher.firstName} ${teacher.lastName}`
      : "Selecciona un docente";
  });

  function handleRowClick(student: StudentUserDTO) {
    goto(`/secretary/search/student/${student.id}`);
  }

  // Adjusted handleEdit to populate data when edit button is clicked
  function handleEdit() {
    editingGroupData = {
      name: groupDetails.name,
      capacity: groupDetails.capacity,
      type: groupDetails.type as AcademicGroupType,
      teacherId: groupDetails.teacher?.id || null,
    };
    selectedTeacherId = groupDetails.teacher?.id || null;
    showEditGroupDialog = true; // Open the main edit dialog
  }

  // Function to handle teacher selection from the dialog
  function onSelectTeacher(teacher: {
    id: string;
    name: string;
    email: string;
  }) {
    selectedTeacherId = teacher.id;
    isTeacherSelectionDialogOpened = false; // Close the teacher selection dialog
  }

  async function submitEditForm() {
    if (!groupDetails?.id) {
      toast.error("Error: Group ID no encontrado para editar.");
      return;
    }

    const payload = { ...editingGroupData, teacherId: selectedTeacherId };

    try {
      await groupsService.updateAcademicGroup(groupDetails.id, payload);
      toast.success("Grupo actualizado exitosamente.");
      showEditGroupDialog = false;
      await invalidateAll();
    } catch (error: any) {
      console.error("Error al actualizar el grupo:", error);
      toast.error(error.message || "Error al actualizar el grupo.");
    }
  }
</script>

<svelte:head>
  <title>Información de Grupo - Sisacad</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold">Información del Grupo</h1>
    <div class="flex space-x-2">
      <Button variant="outline" size="sm" onclick={handleEdit}>
        <Pencil class="mr-2 h-4 w-4" />
        Editar Grupo
      </Button>
      <Button
        href={`/secretary/groups/${data.groupId}/schedule/create`}
        size="sm"
      >
        <Plus class="mr-2 h-4 w-4" />
        Crear Horario
      </Button>
    </div>
  </div>

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

<!-- Edit Group Dialog -->
<Dialog.Root bind:open={showEditGroupDialog}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Editar Grupo Académico</Dialog.Title>
      <Dialog.Description>
        Realiza los cambios deseados en la información del grupo.
      </Dialog.Description>
    </Dialog.Header>
    <form onsubmit={submitEditForm} class="space-y-4">
      <div class="space-y-2">
        <Label.Label for="name">Nombre</Label.Label>
        <Input id="name" type="text" bind:value={editingGroupData.name} />
      </div>
      <div class="space-y-2">
        <Label.Label for="capacity">Capacidad</Label.Label>
        <Input
          id="capacity"
          type="number"
          min="0"
          bind:value={editingGroupData.capacity}
        />
      </div>
      <div class="space-y-2">
        <Label.Label for="type">Tipo de Grupo</Label.Label>
        <Select.Root
          bind:value={editingGroupData.type}
          name="type"
          type="single"
        >
          <Select.Trigger class="w-full">
            {editingGroupData.type || "Selecciona el tipo de grupo"}
          </Select.Trigger>
          <Select.Content>
            {#each Object.values(AcademicGroupType) as typeValue (typeValue)}
              <Select.Item value={typeValue}>{typeValue}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
      <div class="space-y-2">
        <Label.Label for="teacher">Docente</Label.Label>
        <Dialog.Root bind:open={isTeacherSelectionDialogOpened}>
          <Dialog.Trigger
            type="button"
            class={cn(
              buttonVariants({ variant: "outline" }),
              "w-full justify-start font-normal",
              !getTeacherName() && "text-muted-foreground",
            )}
            onclick={() => (isTeacherSelectionDialogOpened = true)}
          >
            {getTeacherName()}
          </Dialog.Trigger>
          <Dialog.Content class="sm:max-w-[800px]">
            <TeacherSelectorDialog onSelect={onSelectTeacher} />
          </Dialog.Content>
        </Dialog.Root>
      </div>
      <Dialog.Footer>
        <Button variant="outline" onclick={() => (showEditGroupDialog = false)}
          >Cancelar</Button
        >
        <Button type="submit">Guardar Cambios</Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
