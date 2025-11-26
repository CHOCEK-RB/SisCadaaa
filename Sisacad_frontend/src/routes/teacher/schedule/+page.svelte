<script lang="ts">
  import type { PageData } from "./$types";
  import ScheduleTable from "$lib/components/ScheduleTable.svelte";

  export let data: PageData;

  const { teacherSchedule, teacherReservations, error } = data;
</script>

<div class="space-y-6">
  <h1 class="text-4xl font-bold tracking-tight">Mi Horario</h1>
  <p class="text-muted-foreground">
    Aquí puedes ver tu horario de clases regular junto con las reservas de aulas
    que has realizado para la semana actual.
  </p>

  {#if error}
    <div class="rounded border border-red-400 bg-red-100 p-4 text-red-500">
      <h2 class="font-bold">Error</h2>
      <p>{error}</p>
    </div>
  {:else}
    <ScheduleTable
      groups={teacherSchedule}
      reservations={teacherReservations}
      showCourseName={true}
    />
  {/if}
</div>
