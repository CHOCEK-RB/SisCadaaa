<script lang="ts">
  import type { PageData } from './$types';
  import type { LayoutData } from '../$types';
  import { AlertCircle } from 'lucide-svelte';
  import ScheduleGrid from '$lib/components/ScheduleGrid.svelte';

  export let data: PageData;
  const fullData = data as LayoutData & PageData;
  const scheduleGroups = fullData.scheduleGroups || [];
  const error = fullData.error;
  const courseName = fullData.courseDetails?.course?.name ?? 'Curso';
</script>

<svelte:head>
  <title>Horario: {courseName} - Sisacad</title>
</svelte:head>

<div class="bg-white p-6 rounded-lg shadow-md border">
  <h2 class="text-xl font-semibold mb-6 text-gray-700">Horario del Curso</h2>

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
  {:else if scheduleGroups && scheduleGroups.length > 0}
    <div class="mb-6">
      <h3 class="text-lg font-medium text-gray-800 mb-4">
        Grupos Matriculados
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {#each scheduleGroups as group (group.id)}
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p class="font-semibold text-gray-800">{group.name}</p>
            <p class="text-sm text-gray-600 capitalize">{group.type}</p>
            {#if group.teacher}
              <p class="text-xs text-gray-500 mt-1">
                {group.teacher.firstName}
                {group.teacher.lastName}
              </p>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <ScheduleGrid groups={scheduleGroups} />
  {:else}
    <div class="text-center py-6">
      <p class="text-gray-500">No hay horarios registrados para este curso.</p>
    </div>
  {/if}
</div>
