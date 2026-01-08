<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Plus } from "lucide-svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Label from "$lib/components/ui/label";
  import type { AcademicCourseDTO } from "$lib/types/course.types";
  import { cn } from "$lib/utils";
  import TeacherSelectionDialog from "./TeacherSelectionDialog.svelte";
  import { groupsService } from "$lib/services/groups.service";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";

  let { academicCourse }: { academicCourse: AcademicCourseDTO } = $props();

  const groupTypes = [
    { value: "laboratory", label: "Laboratorio" },
    { value: "theory", label: "Teoría" },
    { value: "practice", label: "Práctica" },
  ];

  let open = $state(false);
  let name = $state("");
  let capacity = $state<number | null>(null);
  let type = $state<string>(groupTypes[0].value);
  let teacherId = $state<string | undefined>();
  let isTeacherDialogOpened = $state(false);
  let selectedTeacherName = $state<string>("");

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("El nombre del grupo es requerido.");
      return;
    }
    if (capacity === null || capacity <= 0) {
      toast.error("La capacidad debe ser un número positivo.");
      return;
    }

    try {
      await groupsService.createAcademicGroup({
        name,
        capacity,
        type,
        academicCourseId: academicCourse.id,
        teacherId: teacherId || undefined,
      });
      toast.success("Grupo académico creado exitosamente.");
      await invalidateAll();
      open = false;

      name = "";
      capacity = null;
      type = groupTypes[0].value;
      teacherId = undefined;
      selectedTeacherName = "";
    } catch (error) {
      console.error("Error creating academic group:", error);
      toast.error("Error al crear el grupo académico.");
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger
    class={cn(
      buttonVariants({ variant: "default", size: "sm" }),
      "mt-2 w-full",
    )}
  >
    <Plus class="mr-2 h-4 w-4" />
    Crear Nuevo Grupo
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Crear Grupo Académico</Dialog.Title>
      <Dialog.Description>
        Crea un nuevo grupo académico para el curso
        <strong>{academicCourse.course.name}</strong>.
      </Dialog.Description>
    </Dialog.Header>
    <form onsubmit={(e) => handleSubmit(e)}>
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <Label.Label for="name">Nombre del Grupo</Label.Label>
          <Input
            id="name"
            bind:value={name}
            placeholder="Ej: Grupo A, Laboratorio 1"
            required
          />
          <p class="text-[0.8rem] text-muted-foreground">
            Un nombre único para identificar el grupo.
          </p>
        </div>

        <div class="space-y-2">
          <Label.Label for="capacity">Capacidad</Label.Label>
          <Input
            id="capacity"
            type="number"
            bind:value={capacity}
            placeholder="Ej: 30"
            min="1"
            required
          />
          <p class="text-[0.8rem] text-muted-foreground">
            Número máximo de estudiantes en el grupo.
          </p>
        </div>

        <div class="space-y-2">
          <Label.Label for="type">Tipo de Grupo</Label.Label>
          <Select.Root type="single" bind:value={type}>
            <Select.Trigger class="w-full">
              {groupTypes.find((gt) => gt.value === type)?.label ||
                "Selecciona un tipo"}
            </Select.Trigger>
            <Select.Content>
              {#each groupTypes as groupType (groupType.value)}
                <Select.Item value={groupType.value}
                  >{groupType.label}</Select.Item
                >
              {/each}
            </Select.Content>
          </Select.Root>
          <p class="text-[0.8rem] text-muted-foreground">
            Define el tipo de sesiones que tendrá este grupo.
          </p>
        </div>

        <div class="space-y-2">
          <Label.Label for="teacherId">Profesor (Opcional)</Label.Label>
          <Dialog.Root bind:open={isTeacherDialogOpened}>
            <Dialog.Trigger
              type="button"
              class={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-start font-normal",
                !selectedTeacherName && "text-muted-foreground",
              )}
            >
              {selectedTeacherName || "Seleccionar Profesor"}
            </Dialog.Trigger>
            <Dialog.Content class="sm:max-w-[800px]">
              <TeacherSelectionDialog
                onSelect={(teacher) => {
                  teacherId = teacher.id;
                  selectedTeacherName = teacher.name;
                  isTeacherDialogOpened = false;
                }}
              />
            </Dialog.Content>
          </Dialog.Root>
          <p class="text-[0.8rem] text-muted-foreground">
            Asigna un profesor a este grupo académico.
          </p>
        </div>
      </div>
      <Dialog.Footer>
        <Button type="submit">Crear Grupo</Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
