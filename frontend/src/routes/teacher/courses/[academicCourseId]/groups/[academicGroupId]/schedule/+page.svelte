<script lang="ts">
  import type { PageData } from "./$types";
  import type { LayoutData } from "../$types";
  import ScheduleTable from "$lib/components/ScheduleTable.svelte";
  import { AlertCircle, CalendarDays } from "lucide-svelte";

  const { data } = $props<PageData & LayoutData>();

  const groupOrGroups = $derived(data.scheduleGroups ?? []);
  const error = $derived(data.error);
  const courseName = $derived(data.courseDetails?.course?.name ?? "Curso");

  function formatGroupType(type: string): string {
    if (!type) return "";
    const formatted = type.toLowerCase().replace("_", " ");
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
</script>

<svelte:head>
  <title>Horario: {courseName} - Sisacad</title>
</svelte:head>

{#if error}
  <div
    class="flex items-center rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive-foreground"
    role="alert"
  >
    <AlertCircle class="mr-3 h-5 w-5 flex-shrink-0" />
    <div><span class="font-medium">Error:</span> {error}</div>
  </div>
{:else if groupOrGroups.length > 0}
  <h2 class="mb-6 flex items-center gap-2 text-xl font-semibold text-foreground">
    <CalendarDays class="h-5 w-5 text-primary" />
    Horario de Grupos Asignados
  </h2>

  <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each groupOrGroups as group (group.id)}
      <div class="rounded-lg border bg-card p-4">
        <p class="font-semibold text-foreground">Grupo {group.name}</p>
        <p class="text-sm capitalize text-muted-foreground">
          {formatGroupType(group.type)}
        </p>
      </div>
    {/each}
  </div>

  <ScheduleTable groups={groupOrGroups} showCourseName={false} />
{:else}
  <div
    class="rounded-lg border bg-background p-6 text-center shadow-sm"
  >
    <p class="text-muted-foreground">
      No hay horarios registrados para los grupos de este curso.
    </p>
  </div>
{/if}