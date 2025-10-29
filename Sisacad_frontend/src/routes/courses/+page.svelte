<script lang="ts">
  import type { PageData } from './$types';
  import { BookOpen } from 'lucide-svelte';

  export let data: PageData;

  const groupedEnrollments = data.groupedEnrollments;
  const periods = Object.keys(groupedEnrollments || {});
</script>

<svelte:head>
  <title>Mis Cursos - Sisacad</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-gray-800 mb-8">Mis Cursos</h1>

  {#if periods.length > 0}
    {#each periods as period (period)}
      <div class="mb-10">
        <h2 class="text-2xl font-semibold text-gray-700 mb-5 border-b pb-2">
          {period}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each groupedEnrollments[period] as enrollment (enrollment.id)}
            <a
              href={`/courses/${enrollment.academicCourse.id}`}
              class="block bg-white rounded-lg shadow-md hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-shadow duration-200 overflow-hidden border border-gray-200 group"
              aria-label={`Ver detalles del curso ${enrollment.academicCourse.course.name}`}
            >
              <div class="p-5">
                <div class="flex items-center mb-3">
                  <BookOpen class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                  <h3
                    class="text-lg font-bold text-gray-800 truncate"
                    title={enrollment.academicCourse.course.name}
                  >
                    {enrollment.academicCourse.course.name}
                  </h3>
                </div>
                <p class="text-sm text-gray-500 mb-1">
                  Código: <span class="font-medium text-gray-700"
                    >{enrollment.academicCourse.course.code}</span
                  >
                </p>
                <p class="text-sm text-gray-500 mb-1">
                  Semestre: <span class="font-medium text-gray-700"
                    >{enrollment.academicCourse.course.semester}</span
                  >
                </p>
                <p class="text-sm text-gray-500 mb-1">
                  Créditos: <span class="font-medium text-gray-700"
                    >{enrollment.academicCourse.course.credits}</span
                  >
                </p>
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/each}
  {:else}
    <div class="text-center py-10">
      <p class="text-lg text-gray-500">
        No tienes cursos matriculados para mostrar.
      </p>
    </div>
  {/if}
</div>
