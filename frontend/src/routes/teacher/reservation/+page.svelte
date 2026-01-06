<script lang="ts">
  import type { PageData } from "./$types";
  import ClassroomGrid from "$lib/components/reservation/ClassroomGrid.svelte";

  export let data: PageData;

  const { classrooms, todayReservations, error } = data;
</script>

<h1 class="text-4xl font-bold tracking-tight">
  Estado de Aulas en Tiempo Real
</h1>
<p class="mb-6 text-lg text-muted-foreground">
  Seleccione un aula para ver su horario detallado o para realizar una nueva
  reserva. Las aulas en verde están libres ahora mismo.
</p>

{#if error}
  <div class="rounded border border-red-400 bg-red-100 p-4 text-red-500">
    <h2 class="font-bold">Error</h2>
    <p>{error}</p>
  </div>
{:else if classrooms.length === 0}
  <p>No se encontraron aulas disponibles.</p>
{:else}
  <ClassroomGrid {classrooms} reservations={todayReservations} />
{/if}
