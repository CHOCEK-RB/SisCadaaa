<script lang="ts">
  import type { PageData } from "./$types";
  import { AlertTriangle, CircleCheck, FlaskConical } from "lucide-svelte";

  import * as Form from "$lib/components/ui/form";
  import * as RadioGroup from "$lib/components/ui/radio-group";
  import * as Field from "$lib/components/ui/field/index.js";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import { toast } from "svelte-sonner";
  import { schedulesOverlap } from "$lib/utils/schedule.utils";

  import type { AcademicCourseDTO } from "$lib/types/course.types";
  import type { AcademicGroupDTO } from "$lib/types/group.types";
  import { getDynamicSchema } from "./enrollment-schema";

  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";

  let { data } = $props<{ data: PageData }>();

  const formSchema = getDynamicSchema(data.availableCourses);

  const form = superForm(data.form, {
    validators: zod4Client(formSchema),
    onUpdated({ form: updatedForm }) {
      if (updatedForm.valid) {
        form.reset(data.form);
        toast.success("¡Matrícula guardada con éxito!", {
          description: "Serás redirigido a tu horario en 3 segundos...",
        });
        setTimeout(() => {
          goto(resolve("/student/schedule"), { replaceState: true });
        }, 3000);
      } else {
        toast.error("Error al guardar matrícula", {
          description: "Por favor revisa los errores en el formulario.",
        });
      }
    },
  });

  const { form: formData, enhance } = form;

  type LabGroup = AcademicGroupDTO & {
    courseId: string;
    courseName: string;
    currentlyEnrolledLabGroupId?: string;
  };

  const allLabGroups = $derived.by(() => {
    return (
      data.availableCourses?.flatMap(
        (course: AcademicCourseDTO) =>
          course.groups?.map(
            (group): LabGroup => ({
              ...group,
              courseId: course.id,
              courseName: course.course.name,
              currentlyEnrolledLabGroupId: course.currentlyEnrolledLabGroupId,
            }),
          ) || [],
      ) || []
    );
  });

  const allLabGroupsMap = $derived.by(() => {
    return new Map(allLabGroups.map((group: LabGroup) => [group.id, group]));
  });

  const baseScheduleSlots = $derived.by(() =>
    (data.mySchedule || []).flatMap(
      (group: AcademicGroupDTO) => group.schedule ?? [],
    ),
  );

  const conflicts = $derived.by(() => {
    const newConflicts: Record<string, string> = {};
    const selectedGroupIds = Object.values($formData).filter(
      Boolean,
    ) as string[];
    const selectedGroups = selectedGroupIds
      .map((id: string) => allLabGroupsMap.get(id))
      .filter(Boolean) as LabGroup[];

    for (const group of allLabGroups) {
      let conflictMessage = "";

      const isThisGroupCurrentlyEnrolled =
        group.id === group.currentlyEnrolledLabGroupId;

      for (const baseSlot of baseScheduleSlots) {
        for (const labSlot of group.schedule || []) {
          if (isThisGroupCurrentlyEnrolled) {
            const baseSlotGroup = data.mySchedule?.find((g: AcademicGroupDTO) =>
              g.schedule?.some((s) => s.id === baseSlot.id),
            );
            if (baseSlotGroup?.id === group.id) continue;
          }

          if (schedulesOverlap(baseSlot, labSlot)) {
            const conflictingGroup = data.mySchedule?.find(
              (g: AcademicGroupDTO) =>
                g.schedule?.some((s) => s.id === baseSlot.id),
            );
            conflictMessage = `Cruce con ${conflictingGroup?.course.course.name} (${conflictingGroup?.name})`;
            break;
          }
        }
        if (conflictMessage) break;
      }

      if (!conflictMessage) {
        for (const selectedGroup of selectedGroups) {
          if (
            group.id === selectedGroup.id ||
            group.courseId === selectedGroup.courseId
          )
            continue;
          for (const labSlot of group.schedule || []) {
            for (const selectedSlot of selectedGroup.schedule || []) {
              if (schedulesOverlap(labSlot, selectedSlot)) {
                conflictMessage = `Cruce con ${selectedGroup.courseName} (Grupo ${selectedGroup.name})`;
                break;
              }
            }
            if (conflictMessage) break;
          }
          if (conflictMessage) break;
        }
      }

      if (conflictMessage) {
        newConflicts[group.id] = conflictMessage;
      }
    }
    return newConflicts;
  });

  const hasConflictsInSelection = $derived(
    Object.entries($formData).some(([groupId]) => conflicts[groupId]),
  );
</script>

<svelte:head>
  <title>Matrícula de Laboratorios - Sisacad</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="mb-8 flex items-center gap-3">
    <FlaskConical class="h-8 w-8 text-primary" />
    <h1 class="text-3xl font-bold text-foreground">
      Gestionar Matrícula de Laboratorios
    </h1>
  </div>

  <div class="mx-auto max-w-4xl">
    {#if data.error}
      <div
        class="text-destructive-foreground flex items-center rounded-lg border border-destructive bg-destructive/10 p-4 text-sm"
        role="alert"
      >
        <AlertTriangle class="mr-3 h-5 w-5" />
        <div><span class="font-medium">Error:</span> {data.error}</div>
      </div>
    {:else if !data.isPeriodActive}
      <div
        class="flex items-center rounded-lg border border-accent bg-accent/20 p-4 text-sm text-accent-foreground"
        role="alert"
      >
        <AlertTriangle class="mr-3 h-5 w-5" />
        <div>
          <span class="font-medium"
            >El período de matrícula de laboratorios está cerrado.</span
          >
        </div>
      </div>
    {:else if !data.availableCourses || data.availableCourses.length === 0}
      <div
        class="flex items-center rounded-lg border bg-accent/20 p-4 text-sm text-accent-foreground"
        role="alert"
      >
        <CircleCheck class="mr-3 h-5 w-5" />
        <div>
          <span class="font-medium"
            >No hay cursos con laboratorios disponibles para matricular.</span
          >
        </div>
      </div>
    {:else}
      <form method="POST" use:enhance class="space-y-8">
        {#each data.availableCourses as course (course.id)}
          <Form.Fieldset {form} name={course.id}>
            <Form.Legend class="text-xl font-semibold"
              >{course.course.name}</Form.Legend
            >
            <RadioGroup.Root
              class="mt-4 flex flex-col gap-3"
              bind:value={$formData[course.id]}
              name={course.id}
            >
              {#each course.groups || [] as group (group.id)}
                {@const conflict = conflicts[group.id]}
                {@const isSelected = $formData[course.id] === group.id}
                {@const isDisabled = !!conflict && !isSelected}

                <Form.Control>
                  {#snippet children({ props })}
                    <Field.Label for={group.id}>
                      <Field.Field orientation="horizontal">
                        <Field.Content>
                          <Field.Title
                            class="flex items-center gap-2 font-semibold"
                            >Grupo {group.name}
                            {#if group.id === course.currentlyEnrolledLabGroupId}
                              <CircleCheck class="h-4 w-4 text-green-500" />
                            {/if}
                          </Field.Title>
                          <Field.Description
                            class="text-sm text-muted-foreground"
                          >
                            {#each group.schedule as slot (slot.id)}
                              <p>
                                {slot.day}: {slot.start} - {slot.end} (Aula: {slot
                                  .classroom.name})
                              </p>
                            {/each}
                          </Field.Description>
                          {#if conflict}
                            <div
                              class="ml-auto text-right text-xs text-destructive"
                            >
                              <p>{conflict}</p>
                            </div>
                          {/if}
                        </Field.Content>
                        <RadioGroup.Item
                          value={group.id}
                          {...props}
                          disabled={isDisabled}
                          id={group.id}
                        />
                      </Field.Field>
                    </Field.Label>
                  {/snippet}
                </Form.Control>
              {/each}
            </RadioGroup.Root>
            <Form.FieldErrors />
          </Form.Fieldset>
        {/each}

        <div
          class="sticky bottom-0 rounded-t-lg border-t bg-background/80 p-4 shadow-lg backdrop-blur-sm"
        >
          {#if hasConflictsInSelection}
            <div
              class="mb-4 flex items-center rounded-lg bg-destructive/10 p-4 text-sm text-destructive"
              role="alert"
            >
              <AlertTriangle class="mr-3 h-5 w-5" />
              Tienes conflictos de horario en tus selecciones.
            </div>
          {/if}
          <Form.Button
            class="h-12 w-full"
            disabled={hasConflictsInSelection || !form.validateForm}
          >
            Guardar Cambios
          </Form.Button>
        </div>
      </form>
    {/if}
  </div>
</div>
