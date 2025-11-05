<script lang="ts">
  import type { PageData } from "./$types";
  import { BookOpen, AlertTriangle } from "lucide-svelte";

  let { data } = $props<{ data: PageData }>();

  const groupsForPeriods = $derived(data.groups || {});
  const periods = $derived(Object.keys(groupsForPeriods).sort().reverse());
  const error = $derived(data.error);

  function formatGroupType(type: string): string {
    if (!type) return "";
    const formatted = type.toLowerCase().replace("_", " ");
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
</script>

<svelte:head>
  <title>Mis Cursos Asignados - Sisacad</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="mb-8 text-3xl font-bold text-gray-800">Mis Cursos Asignados</h1>

  {#if error}
    <div
      class="flex items-center rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      role="alert"
    >
      <AlertTriangle class="mr-3 h-5 w-5 flex-shrink-0" />
      <div><span class="font-medium">Error:</span> {error}</div>
    </div>
  {:else if periods.length > 0}
    {#each periods as period (period)}
      <div class="mb-10">
        <h2 class="mb-5 border-b pb-2 text-2xl font-semibold text-gray-700">
          {period}
        </h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {#each groupsForPeriods[period] as group (group.id)}
            <a
              href={`/teacher/courses/${group.course.id}`}
              class="focus:ring-opacity-50 group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-200 hover:shadow-lg focus:shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-label={`Ver detalles del curso ${group.course.course.name}`}
            >
              <div class="p-5">
                <div class="mb-3 flex items-center">
                  <BookOpen class="mr-2 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <h3
                    class="truncate text-lg font-bold text-gray-800"
                    title={group.course.course.name}
                  >
                    {group.course.course.name}
                  </h3>
                </div>

                <p class="text-md mb-3 font-medium text-blue-700">
                  Grupo: {group.name}
                  <span class="text-sm text-gray-600 capitalize">
                    ({formatGroupType(group.type)})
                  </span>
                </p>

                <p class="mb-1 text-sm text-gray-500">
                  Código: <span class="font-medium text-gray-700"
                    >{group.course.course.code}</span
                  >
                </p>
                <p class="mb-1 text-sm text-gray-500">
                  Semestre: <span class="font-medium text-gray-700"
                    >{group.course.course.semester}</span
                  >
                </p>
                <p class="mb-1 text-sm text-gray-500">
                  Créditos: <span class="font-medium text-gray-700"
                    >{group.course.course.credits}</span
                  >
                </p>
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/each}
  {:else}
    <div class="py-10 text-center">
      <p class="text-lg text-gray-500">
        No tienes cursos asignados para mostrar.
      </p>
    </div>
  {/if}
</div>
