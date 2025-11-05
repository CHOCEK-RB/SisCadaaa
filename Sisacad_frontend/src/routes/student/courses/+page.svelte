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
  <h1 class="mb-8 text-3xl font-bold text-gray-800">Mis Cursos</h1>

  {#if periods.length > 0}
    {#each periods as period (period)}
      <div class="mb-10">
        <h2 class="mb-5 border-b pb-2 text-2xl font-semibold text-gray-700">
          {period}
        </h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {#each groupedEnrollments[period] as enrollment (enrollment.id)}
            <a
              href={`/student/courses/${enrollment.academicCourse.id}`}
              class="focus:ring-opacity-50 group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-200 hover:shadow-lg focus:shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-label={`Ver detalles del curso ${enrollment.academicCourse.course.name}`}
            >
              <div class="p-5">
                <div class="mb-3 flex items-center">
                  <BookOpen class="mr-2 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <h3
                    class="truncate text-lg font-bold text-gray-800"
                    title={enrollment.academicCourse.course.name}
                  >
                    {enrollment.academicCourse.course.name}
                  </h3>
                </div>
                <p class="mb-1 text-sm text-gray-500">
                  Código: <span class="font-medium text-gray-700"
                    >{enrollment.academicCourse.course.code}</span
                  >
                </p>
                <p class="mb-1 text-sm text-gray-500">
                  Semestre: <span class="font-medium text-gray-700"
                    >{enrollment.academicCourse.course.semester}</span
                  >
                </p>
                <p class="mb-1 text-sm text-gray-500">
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
    <div class="py-10 text-center">
      <p class="text-lg text-gray-500">
        No tienes cursos matriculados para mostrar.
      </p>
    </div>
  {/if}
</div>
