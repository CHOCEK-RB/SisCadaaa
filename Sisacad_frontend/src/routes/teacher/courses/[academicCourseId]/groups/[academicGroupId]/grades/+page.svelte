<script lang="ts">
  import TeacherGradesTable from "$lib/components/grades/TeacherGradesTable.svelte";
  import ContinuousGradesChart from "$lib/components/grades/ContinuousGradesChart.svelte";
  import PartialGradesChart from "$lib/components/grades/PartialGradesChart.svelte";
  import { BarChart, TriangleAlert } from "lucide-svelte";

  let { data } = $props<{ data: any }>();
  console.log(data);
</script>

<svelte:head>
  <title>Notas del Grupo - Sisacad</title>
</svelte:head>

<div class="container mx-auto space-y-8 px-4 py-8">
  {#if data.error}
    <div
      class="mb-4 flex items-center rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      role="alert"
    >
      <TriangleAlert class="mr-3 h-5 w-5 flex-shrink-0" />
      <div><span class="font-medium">Error:</span> {data.error}</div>
    </div>
  {:else if data.groupGrades}
    <div>
      <h1 class="text-3xl font-bold text-gray-800">
        Notas - Grupo {data.groupGrades.groupName}
      </h1>
      <p class="text-gray-600">
        {data.groupGrades.courseName} ({data.groupGrades.courseCode}) - {data
          .groupGrades.groupType}
      </p>
    </div>

    <ContinuousGradesChart groupData={data.groupGrades} />
    <PartialGradesChart groupData={data.groupGrades} />

    <div>
      <h2 class="mb-4 text-xl font-semibold text-gray-800">
        Calificaciones Detalladas
      </h2>
      <TeacherGradesTable groupGradesData={data.groupGrades} />
    </div>
  {:else}
    <div class="rounded-lg border bg-white p-8 text-center shadow-md">
      <BarChart class="mx-auto mb-4 h-16 w-16 text-gray-400" />
      <p class="mb-2 text-lg text-gray-600">
        No hay calificaciones registradas para este grupo.
      </p>
      <p class="text-sm text-gray-500">
        Las calificaciones aparecerán aquí una vez que se registren.
      </p>
    </div>
  {/if}
</div>
