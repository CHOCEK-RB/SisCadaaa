<script lang="ts">
  import type { PageData, LayoutData } from './$types';
  import { AlertCircle } from 'lucide-svelte';
  import ScheduleTable from '$lib/components/ScheduleTable.svelte';
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from '$lib/components/ui/card';

  let { data }: { data: PageData & LayoutData } = $props();

  const scheduleGroups = data.scheduleGroups || [];
  const error = data.error;
  const courseName = data.courseDetails?.course?.name ?? 'Curso';
</script>

<svelte:head>
  <title>Horario: {courseName} - Sisacad</title>
</svelte:head>

<div class="space-y-6">
  {#if error}
    <div
      class="flex items-center rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive-foreground"
      role="alert"
    >
      <AlertCircle class="mr-3 h-5 w-5 flex-shrink-0" />
      <div>
        <span class="font-medium">Error:</span>
        {error}
      </div>
    </div>
  {:else if scheduleGroups && scheduleGroups.length > 0}
    <div>
      <h3 class="mb-4 text-xl font-semibold">Grupos Matriculados</h3>
      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {#each scheduleGroups as group (group.id)}
          <Card.Root>
            <Card.Header class="p-4">
              <Card.Title>Grupo {group.name}</Card.Title>
              <Card.Description class="capitalize"
                >{group.type}</Card.Description
              >
            </Card.Header>
            {#if group.teacher}
              <Card.Content class="p-4 pt-0">
                <p class="text-xs text-muted-foreground">
                  {group.teacher.firstName}
                  {group.teacher.lastName}
                </p>
              </Card.Content>
            {/if}
          </Card.Root>
        {/each}
      </div>
    </div>

    <ScheduleTable groups={scheduleGroups} showCourseName={false} />
  {:else}
    <Card.Root class="text-center">
      <Card.Content class="p-6">
        <p class="text-muted-foreground">
          No hay horarios registrados para este curso.
        </p>
      </Card.Content>
    </Card.Root>
  {/if}
</div>
