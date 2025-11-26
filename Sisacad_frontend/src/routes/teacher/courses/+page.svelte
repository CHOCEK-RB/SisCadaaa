<script lang="ts">
  import type { PageData } from "./$types";
  import { BookOpen, AlertTriangle } from "lucide-svelte";
  import * as Sidebar from "$lib/components/ui/sidebar";

  export let data: PageData;

  const groupedCourses = data.groupedCourses;
  const periods = Object.keys(groupedCourses || {})
    .sort()
    .reverse();
  const error = data.error;
</script>

<svelte:head>
  <title>Mis Cursos - Sisacad</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="mb-8 text-3xl font-bold text-foreground">Mis Cursos</h1>

  {#if error}
    <div
      class="mb-8 flex items-center rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      role="alert"
    >
      <AlertTriangle class="mr-3 h-5 w-5 flex-shrink-0" />
      <div><span class="font-medium">Error:</span> {error}</div>
    </div>
  {:else if periods.length > 0}
    <div class="space-y-8">
      {#each periods as period (period)}
        <Sidebar.Group>
          <Sidebar.GroupLabel class="text-xl">
            Periodo: {period}
          </Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {#each groupedCourses[period] as group (group.id)}
                <Sidebar.MenuItem class="p-0">
                  <a
                    href={`/teacher/courses/${group.id}`}
                    class="flex w-full items-center gap-4 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
                    aria-label={`Ver detalles del curso ${group.course.course.name}`}
                  >
                    <div
                      class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    >
                      <BookOpen class="h-5 w-5" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div
                        class="truncate text-base font-medium text-foreground"
                      >
                        {group.course.course.name} - {group.name}
                      </div>
                      <div class="truncate text-xs text-muted-foreground">
                        {group.course.course.code}
                      </div>
                    </div>
                  </a>
                </Sidebar.MenuItem>
              {/each}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      {/each}
    </div>
  {:else}
    <div class="py-10 text-center">
      <p class="text-lg text-muted-foreground">
        No tienes cursos asignados para mostrar.
      </p>
    </div>
  {/if}
</div>
