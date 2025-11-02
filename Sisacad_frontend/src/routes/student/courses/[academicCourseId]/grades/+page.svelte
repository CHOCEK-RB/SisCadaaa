<script lang="ts">
  import type { PageData } from './$types';
  import type { LayoutData } from '../$types';
  import { AlertCircle, CheckCircle } from 'lucide-svelte';

  export let data: PageData;
  const fullData = data as LayoutData & PageData;
  const grades = fullData.grades;
  const error = fullData.error;
  const courseName = fullData.courseDetails?.course?.name ?? 'Curso';
  const gradeLabels: { [key: string]: string } = {
    firstContinue: 'Continua 1',
    secondContinue: 'Continua 2',
    thirdContinue: 'Continua 3',
    firstPartial: 'Parcial 1',
    secondPartial: 'Parcial 2',
    thirdPartial: 'Parcial 3',
  };

  let formattedGrades: { label: string; value: number | string }[] = [];
  if (grades) {
    formattedGrades = Object.entries(grades)
      .filter(
        ([key, value]) =>
          gradeLabels[key] !== undefined &&
          value !== null &&
          value !== undefined,
      )
      .map(([key, value]) => ({
        label: gradeLabels[key],
        value: typeof value === 'number' ? value : String(value),
      }));
  }

  let average: number | null = null;
  if (formattedGrades.length > 0) {
    const numericGrades = formattedGrades
      .map((g) =>
        typeof g.value === 'number' ? g.value : parseFloat(String(g.value)),
      )
      .filter((v) => !isNaN(v));
    if (numericGrades.length > 0) {
      const sum = numericGrades.reduce((acc, val) => acc + val, 0);
      average = Math.round((sum / numericGrades.length) * 10) / 10; // Promedio con 1 decimal
    }
  }
  const isApproved = average !== null && average >= 10.5; // Asumiendo que 10.5 es aprobatorio
</script>

<svelte:head>
  <title>Mis Notas: {courseName} - Sisacad</title>
</svelte:head>

<div class="bg-white p-6 rounded-lg shadow-md border">
  <h2 class="text-xl font-semibold mb-6 text-gray-700">Mis Notas</h2>

  {#if error}
    <div
      class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200"
      role="alert"
    >
      <AlertCircle class="w-5 h-5 mr-3 flex-shrink-0" />
      <div>
        <span class="font-medium">Error:</span>
        {error}
      </div>
    </div>
  {:else if grades && formattedGrades.length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each formattedGrades as gradeItem (gradeItem.label)}
        <div
          class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center"
        >
          <p class="text-sm font-medium text-gray-500">{gradeItem.label}</p>
          <p class="mt-1 text-2xl font-bold text-gray-800">{gradeItem.value}</p>
        </div>
      {/each}
    </div>

    {#if average !== null}
      <div class="mt-8 pt-6 border-t">
        <div
          class="flex flex-col sm:flex-row items-center justify-center sm:justify-between bg-gray-100 p-4 rounded-lg"
        >
          <p class="text-lg font-semibold text-gray-700 mb-2 sm:mb-0">
            Promedio Actual:
          </p>
          <p
            class="text-3xl font-bold {isApproved
              ? 'text-green-600'
              : 'text-red-600'}"
          >
            {average.toFixed(1)}
            {#if isApproved}
              <CheckCircle class="w-6 h-6 inline ml-2 mb-1 text-green-500" />
            {/if}
          </p>
        </div>
      </div>
    {/if}
  {:else}
    <div class="text-center py-6">
      <p class="text-gray-500">
        Aún no se han registrado notas para este curso.
      </p>
    </div>
  {/if}
</div>
