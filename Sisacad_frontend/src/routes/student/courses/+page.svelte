<script lang="ts">
  import type { PageData } from "./$types";
  import { BookOpen } from "lucide-svelte";
  import * as Sidebar from "$lib/components/ui/sidebar";

  export let data: PageData;

  const groupedEnrollments = data.groupedEnrollments;
  const periods = Object.keys(groupedEnrollments || {})
    .sort()
    .reverse();
</script>

<svelte:head>
  <title>Mis Cursos - Sisacad</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="mb-8 text-3xl font-bold text-foreground">Mis Cursos</h1>

  {#if periods.length > 0}
    <div class="space-y-8">
      {#each periods as period (period)}
        <Sidebar.Group>
          <Sidebar.GroupLabel class="text-xl">
            Periodo: {period}
          </Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {#each groupedEnrollments[period] as enrollment (enrollment.id)}
                <Sidebar.MenuItem class="p-0">
                  <a
                    href={`/student/courses/${enrollment.academicCourse.id}`}
                    class="flex w-full items-center gap-4 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
                    aria-label={`Ver detalles del curso ${enrollment.academicCourse.course.name}`}
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
                        {enrollment.academicCourse.course.name}
                      </div>
                      <div class="truncate text-xs text-muted-foreground">
                        {enrollment.academicCourse.course.code}
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
        No tienes cursos matriculados para mostrar.
      </p>
    </div>
  {/if}
</div>
