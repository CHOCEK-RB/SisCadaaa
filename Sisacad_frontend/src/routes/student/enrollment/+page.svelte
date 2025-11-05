<script lang="ts">
  import type { PageData } from "./$types";
  import type {
    AcademicGroupDTO,
    ScheduleSlotDTO,
  } from "$lib/types/group.types";
  import {
    AlertTriangle,
    CircleCheck,
    Clock,
    FlaskConical,
    LoaderCircle,
    MapPin,
    Users,
  } from "lucide-svelte";
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
  import { enrollmentService } from "$lib/services/enrollment.service";
  import { authStore } from "$lib/store/auth.store";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import type { AcademicCourseDTO } from "$lib/types/course.types";

  let { data } = $props<{ data: PageData }>();

  let availableCourses = $state(data.availableCourses || []);

  let isPeriodActive = $state(data.isPeriodActive);
  let pageError = $state(data.error);

  let isLoading = $state(false);
  let apiError = $state("");
  let successMessage = $state("");

  let selections = new SvelteMap<string, string | null>(
    availableCourses.map((course: AcademicCourseDTO) => [
      course.id,
      course.currentlyEnrolledLabGroupId || null,
    ]),
  );

  let allGroupsMap = $derived(() => {
    const map = new SvelteMap<string, AcademicGroupDTO>();
    for (const course of availableCourses) {
      for (const group of course.groups || []) {
        map.set(group.id, group);
      }
    }
    return map;
  });

  function timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + (minutes || 0);
  }

  function doSlotsOverlap(
    slotA: ScheduleSlotDTO,
    slotB: ScheduleSlotDTO,
  ): boolean {
    if (slotA.day !== slotB.day) {
      return false;
    }

    const startA = timeToMinutes(slotA.start);
    const endA = timeToMinutes(slotA.end);
    const startB = timeToMinutes(slotB.start);
    const endB = timeToMinutes(slotB.end);

    return startA < endB && endA > startB;
  }

  let conflictingGroupIds = $derived(() => {
    const conflicts = new SvelteSet<string>();
    const selectedSlots: (ScheduleSlotDTO & { parentGroupId: string })[] = [];

    for (const selectedGroupId of selections.values()) {
      if (selectedGroupId) {
        const group = allGroupsMap().get(selectedGroupId);
        if (group?.schedule) {
          for (const slot of group.schedule) {
            selectedSlots.push({ ...slot, parentGroupId: group.id });
          }
        }
      }
    }

    for (let i = 0; i < selectedSlots.length; i++) {
      for (let j = i + 1; j < selectedSlots.length; j++) {
        if (doSlotsOverlap(selectedSlots[i], selectedSlots[j])) {
          conflicts.add(selectedSlots[i].parentGroupId);
          conflicts.add(selectedSlots[j].parentGroupId);
        }
      }
    }

    return conflicts;
  });

  let allSelectionsMade = $derived(
    availableCourses.length > 0 &&
      Array.from(selections.values()).every((id) => id !== null),
  );

  let hasConflicts = $derived(conflictingGroupIds().size > 0);

  let canSubmit = $derived(
    allSelectionsMade && !hasConflicts && !isLoading && !successMessage,
  );

  async function handleSubmitEnrollment() {
    if (!canSubmit) return;

    isLoading = true;
    apiError = "";
    successMessage = "";

    const token = authStore.getToken();
    if (!token) {
      apiError = "Sesión expirada. Por favor, inicia sesión de nuevo.";
      isLoading = false;
      return;
    }

    const selectedGroupIds = Array.from(selections.values()).filter(
      (id) => id !== null,
    ) as string[];

    try {
      await enrollmentService.enrollInLabGroups(token, selectedGroupIds);

      successMessage =
        "¡Matrícula actualizada! Tus cambios han sido guardados. Serás redirigido a tu horario.";

      availableCourses = [];

      setTimeout(() => {
        goto(resolve("/student/schedule"), { replaceState: true });
      }, 3000);
    } catch (err: any) {
      console.error("Error al matricular:", err);
      apiError = err.message || "Ocurrió un error al procesar tu matrícula.";
    } finally {
      isLoading = false;
    }
  }

  function getDayName(dayKey: string): string {
    // ... (código existente sin cambios)
    const days: Record<string, string> = {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
    };
    return days[dayKey.toLowerCase()] || dayKey;
  }
</script>

<svelte:head>
  <title>Matrícula de Laboratorios - Sisacad</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="mb-8 flex items-center gap-3">
    <FlaskConical class="h-8 w-8 text-blue-600" />
    <h1 class="text-3xl font-bold text-gray-800">
      Gestionar Matrícula de Laboratorios
    </h1>
  </div>

  <div class="mx-auto max-w-4xl">
    {#if pageError}
      <div
        class="flex items-center rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        role="alert"
      >
        <AlertTriangle class="mr-3 h-5 w-5 flex-shrink-0" />
        <div><span class="font-medium">Error:</span> {pageError}</div>
      </div>
    {:else if !isPeriodActive}
      <div
        class="flex items-center rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"
        role="alert"
      >
        <AlertTriangle class="mr-3 h-5 w-5 flex-shrink-0" />
        <div>
          <span class="font-medium"
            >El período de matrícula de laboratorios está cerrado.</span
          >
        </div>
      </div>
    {:else if availableCourses.length === 0 && !successMessage}
      <div
        class="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800"
        role="alert"
      >
        <CircleCheck class="mr-3 h-5 w-5 flex-shrink-0" />
        <div>
          <span class="font-medium"
            >No hay cursos con laboratorios disponibles para matricular o
            modificar en este momento.</span
          >
        </div>
      </div>
    {:else if availableCourses.length > 0}
      <div class="space-y-6">
        <p class="text-gray-600">
          Revisa y modifica tus grupos de laboratorio. El sistema validará que
          no tengas cruces de horario.
        </p>

        {#each availableCourses as course (course.id)}
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
            <h2 class="mb-1 text-xl font-semibold text-gray-800">
              {course.course.name}
            </h2>
            <p class="mb-4 text-sm text-gray-500">
              Código: {course.course.code}
            </p>

            <div class="space-y-3">
              {#if !course.groups || course.groups.length === 0}
                <p class="text-gray-500 italic">
                  No hay grupos de laboratorio con vacantes para este curso.
                </p>
              {:else}
                {#each course.groups as group (group.id)}
                  {@const isSelected = selections.get(course.id) === group.id}
                  {@const isConflict = conflictingGroupIds().has(group.id)}
                  <label
                    class="block cursor-pointer rounded-lg border-2 p-4 transition-all {isConflict
                      ? 'border-red-400 bg-red-50'
                      : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-400'}"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <input
                          type="radio"
                          name="lab-group-{course.id}"
                          value={group.id}
                          checked={isSelected}
                          onchange={() => {
                            selections.set(course.id, group.id);
                          }}
                          class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span class="ml-3 font-medium text-gray-900"
                          >Grupo {group.name}</span
                        >
                      </div>
                      <div
                        class="text-sm font-medium {group.enrollmentsCount! >=
                        group.capacity!
                          ? 'text-red-600'
                          : 'text-green-600'}"
                      >
                        <Users class="-mt-1 mr-1 inline h-4 w-4" />
                        {group.enrollmentsCount} / {group.capacity}
                      </div>
                    </div>

                    <div class="mt-3 space-y-2 pl-7">
                      {#if isConflict}
                        <p class="text-sm font-medium text-red-600">
                          ¡Conflicto de horario detectado!
                        </p>
                      {/if}
                      {#each group.schedule || [] as slot (slot.id)}
                        <div class="flex items-center text-sm text-gray-700">
                          <Clock class="mr-2 h-4 w-4 text-gray-500" />
                          <span class="w-20 font-medium"
                            >{getDayName(slot.day)}:</span
                          >
                          <span>{slot.start} - {slot.end}</span>
                          <MapPin class="mr-2 ml-4 h-4 w-4 text-gray-500" />
                          <span class="font-medium">{slot.classroom.name}</span>
                        </div>
                      {/each}
                    </div>
                  </label>
                {/each}
              {/if}
            </div>
          </div>
        {/each}

        <div
          class="sticky bottom-0 rounded-t-lg border-t border-gray-200 bg-white p-6 shadow-lg"
        >
          {#if apiError}
            <div
              class="mb-4 flex items-center rounded-lg bg-red-50 p-4 text-sm text-red-800"
              role="alert"
            >
              <AlertTriangle class="mr-3 h-5 w-5" />
              {apiError}
            </div>
          {/if}
          {#if hasConflicts}
            <div
              class="mb-4 flex items-center rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800"
              role="alert"
            >
              <AlertTriangle class="mr-3 h-5 w-5" />
              Tienes conflictos de horario. Por favor, revisa tus selecciones.
            </div>
          {:else if !allSelectionsMade}
            <div
              class="mb-4 flex items-center rounded-lg bg-blue-50 p-4 text-sm text-blue-800"
              role="alert"
            >
              <AlertTriangle class="mr-3 h-5 w-5" />
              Debes seleccionar un laboratorio para cada curso.
            </div>
          {/if}

          <button
            type="button"
            class="flex h-12 w-full items-center justify-center rounded-lg px-6 py-3 font-semibold text-white transition-colors
            {canSubmit
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-400'}"
            disabled={!canSubmit}
            onclick={handleSubmitEnrollment}
          >
            {#if isLoading}
              <LoaderCircle class="mr-2 h-5 w-5 animate-spin" />
              Procesando...
            {:else}
              Guardar Cambios ({Array.from(selections.values()).filter((v) => v)
                .length} / {availableCourses.length})
            {/if}
          </button>
        </div>
      </div>
    {:else if successMessage}
      <div
        class="flex items-center rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        role="alert"
      >
        <CircleCheck class="mr-3 h-5 w-5 flex-shrink-0" />
        <div>
          <span class="font-medium">¡Éxito!</span>
          {successMessage}
        </div>
      </div>
    {/if}
  </div>
</div>
