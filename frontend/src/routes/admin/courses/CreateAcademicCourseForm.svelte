<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Select from "$lib/components/ui/select";
  import * as Label from "$lib/components/ui/label";
  import { buttonVariants, Button } from "$lib/components/ui/button";
  import type { GlobalEvent } from "$lib/types/event.types";
  import { academicCourseService } from "$lib/services/academic_course.service";
  import { toast } from "svelte-sonner";
  import CourseSelectionDialog from "./CourseSelectionDialog.svelte";
  import TeacherSelectionDialog from "./TeacherSelectionDialog.svelte";
  import { invalidateAll } from "$app/navigation";

  let selectedCourseId = $state<string | undefined>(undefined);
  let selectedCoordinatorId = $state<string | undefined>(undefined);
  let selectedAcademicPeriodId = $state<string | undefined>(undefined);

  let selectedCourseName = $state<string>("");
  let selectedCoordinatorName = $state<string>("");

  let { activePeriods } = $props<{ activePeriods: GlobalEvent[] }>();

  let isCourseDialogOpened = $state(false);
  let isTeacherDialogOpened = $state(false);
  let isDialogOpen = $state(false);

  $effect(() => {
    if (activePeriods.length > 0) {
      selectedAcademicPeriodId = activePeriods[0].id;
    }
    console.log("Active periods received via prop:", activePeriods);
  });

  async function handleSubmit(event: Event) {
    if (!selectedCourseId || !selectedAcademicPeriodId) {
      toast.error("Debe seleccionar un curso y un período académico.");
      return;
    }
    try {
      await academicCourseService.createAcademicCourse({
        courseId: selectedCourseId,
        coordinatorId: selectedCoordinatorId,
        academicPeriodId: selectedAcademicPeriodId,
      });
      toast.success("Curso académico creado exitosamente.");
      await invalidateAll();
      isDialogOpen = false;
    } catch (error) {
      console.error("Error creating academic course:", error);
      toast.error("Error al crear el curso académico.");
    }
  }
</script>

<Dialog.Root bind:open={isDialogOpen}>
  <Dialog.Trigger type="button" class={buttonVariants({ variant: "default" })}
    >Crear Nuevo Curso Académic</Dialog.Trigger
  >
  <Dialog.Content class="sm:max-w-[800px]">
    <Dialog.Header>
      <Dialog.Title>Crear Nuevo Curso Académico</Dialog.Title>
      <Dialog.Description
        >Completa los datos para crear un nuevo curso académico.</Dialog.Description
      >
    </Dialog.Header>
    <form onsubmit={(e) => handleSubmit(e)} class="grid gap-4 py-4">
      <div class="align-center grid grid-cols-4 items-center gap-4">
        <Label.Label for="course-search" class="text-right">Curso</Label.Label>
        <div class="col-span-3">
          <Dialog.Root bind:open={isCourseDialogOpened}>
            <Dialog.Trigger
              type="button"
              class="w-[95%] {buttonVariants({ variant: 'outline' })}"
            >
              {selectedCourseName || "Seleccionar Curso"}
            </Dialog.Trigger>
            <Dialog.Content class="sm:max-w-[800px]">
              <CourseSelectionDialog
                onSelect={(course) => {
                  selectedCourseId = course.id;
                  selectedCourseName = `${course.name} (${course.code})`;
                  isCourseDialogOpened = false;
                }}
              />
            </Dialog.Content>
          </Dialog.Root>
          {#if !selectedCourseId}
            <p class="mt-1 text-sm text-red-500">Debe seleccionar un curso.</p>
          {/if}
        </div>
      </div>

      <div class="grid grid-cols-4 items-center gap-4">
        <Label.Label for="coordinator-search" class="text-left"
          >Coordinador (Opcional)</Label.Label
        >
        <div class="col-span-3">
          <Dialog.Root bind:open={isTeacherDialogOpened}>
            <Dialog.Trigger
              type="button"
              class="w-[95%] {buttonVariants({ variant: 'outline' })}"
            >
              {selectedCoordinatorName || "Seleccionar Coordinador"}
            </Dialog.Trigger>
            <Dialog.Content class="sm:max-w-[800px]">
              <TeacherSelectionDialog
                onSelect={(teacher) => {
                  selectedCoordinatorId = teacher.id;
                  selectedCoordinatorName = teacher.name;
                  isTeacherDialogOpened = false;
                }}
              />
            </Dialog.Content>
          </Dialog.Root>
          {#if !selectedCoordinatorId}
            <p class="mt-1 text-sm text-gray-500">
              (Opcional) Un coordinador puede ser asignado posteriormente.
            </p>
          {/if}
        </div>
      </div>

      <div class="grid grid-cols-4 items-center gap-4">
        <Label.Label for="academic-period" class="text-right"
          >Período Académico</Label.Label
        >
        <Select.Root type="single" bind:value={selectedAcademicPeriodId}>
          <Select.Trigger class="col-span-3">
            {selectedAcademicPeriodId
              ? activePeriods.find((p) => p.id === selectedAcademicPeriodId)
                  ?.name
              : "Seleccionar Período"}
          </Select.Trigger>
          <Select.Content>
            {#each activePeriods as period (period.id)}
              <Select.Item value={period.id} label={period.name}>
                {period.name}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
      <Dialog.Footer>
        <Dialog.Close
          type="button"
          class={buttonVariants({ variant: "outline" })}>Cancelar</Dialog.Close
        >
        <Button type="submit">Crear Curso Académico</Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
