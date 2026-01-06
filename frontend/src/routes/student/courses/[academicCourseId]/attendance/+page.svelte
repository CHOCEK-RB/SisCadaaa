<script lang="ts">
  import type { PageData } from "./$types";
  import { AlertCircle } from "lucide-svelte";
  import * as Card from "$lib/components/ui/card";
  import AttendanceSummary from "$lib/components/attendance/AttendanceSummary.svelte";
  import AttendanceTable from "$lib/components/attendance/AttendanceTable.svelte";

  export let data: PageData;
  const attendanceData = data.attendanceData ?? [];
  const errorMessage = data.error;

  function capitalize(str: string | undefined | null): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
</script>

<svelte:head>
  <title>Mi Asistencia - Sisacad</title>
</svelte:head>

<div class="space-y-6">
  {#if errorMessage}
    <div
      class="text-destructive-foreground flex items-center rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm"
      role="alert"
    >
      <AlertCircle class="mr-3 h-5 w-5 flex-shrink-0" />
      <div>
        <span class="font-medium">Error:</span>
        {errorMessage}
      </div>
    </div>
  {:else if attendanceData.length > 0}
    {#each attendanceData as groupAttendance (groupAttendance.groupId)}
      <Card.Root>
        <Card.Header>
          <Card.Title>
            Asistencia - {capitalize(groupAttendance.groupType)} ({groupAttendance.groupName})
          </Card.Title>
        </Card.Header>
        <Card.Content class="space-y-6">
          <AttendanceSummary summary={groupAttendance} />
          <AttendanceTable records={groupAttendance.records} />
        </Card.Content>
      </Card.Root>
    {/each}
  {:else}
    <Card.Root>
      <Card.Content class="p-6 text-center text-muted-foreground">
        No se encontraron datos de asistencia para este curso o aún no se han
        registrado clases.
      </Card.Content>
    </Card.Root>
  {/if}
</div>
