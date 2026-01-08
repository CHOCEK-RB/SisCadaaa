<script lang="ts">
  import type { PageData } from "./$types";
  import TeacherGradesTable from "$lib/components/grades/TeacherGradesTable.svelte";

  let { data } = $props<{ data: PageData }>();

  const groupGrades = $derived(data.groupGrades);
</script>

<svelte:head>
  <title>Notas del Grupo - Sisacad</title>
</svelte:head>

<div class="space-y-6">
  <h2 class="mb-4 text-xl font-bold">Notas del Grupo</h2>
  {#if groupGrades}
    <TeacherGradesTable groupGradesData={groupGrades} />
  {:else}
    <p class="text-muted-foreground">
      No hay notas disponibles para este grupo.
    </p>
  {/if}
</div>
