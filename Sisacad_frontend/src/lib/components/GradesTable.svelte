<script lang="ts">
  import type { GradesAndPercent } from '$lib/services/enrollment.service';
  import { TrendingUp, TrendingDown } from 'lucide-svelte';

  let { gradesData = [] } = $props<{
    gradesData: GradesAndPercent[];
  }>();

  const gradeLabels: { [key: string]: string } = {
    firstContinue: 'C1',
    secondContinue: 'C2',
    thirdContinue: 'C3',
    firstPartial: 'P1',
    secondPartial: 'P2',
    thirdPartial: 'P3',
  };

  interface CourseGrade {
    courseName: string;
    courseCode: string;
    grades: { [key: string]: number };
    average: number;
    status: 'approved' | 'failed' | 'pending';
  }

  function calculateWeightedAverage(grades: any, percent: any): number {
    let total = 0;
    let count = 0;

    Object.entries(gradeLabels).forEach(([key]) => {
      const grade = grades[key];
      const weight = percent[key];

      if (grade !== null && grade !== undefined && weight) {
        total += (grade * weight) / 100;
        count++;
      }
    });

    return count > 0 ? Math.round(total * 10) / 10 : 0;
  }

  const processedGrades = $derived(() => {
    return gradesData.map((item: GradesAndPercent) => {
      const grades: { [key: string]: number } = {};

      Object.entries(gradeLabels).forEach(([key]) => {
        const value = item.grades[key as keyof typeof item.grades];
        if (value !== null && value !== undefined) {
          grades[key] = value;
        }
      });

      const average = calculateWeightedAverage(item.grades, item.percent);

      let status: 'approved' | 'failed' | 'pending' = 'pending';
      if (Object.keys(grades).length > 0) {
        status = average >= 10.5 ? 'approved' : 'failed';
      }

      return {
        courseName: item.course.course?.name || 'Sin nombre',
        courseCode: item.course.course?.code || 'N/A',
        grades,
        average,
        status,
      } as CourseGrade;
    });
  });

  function getStatusColor(status: string): string {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'failed':
        return 'Reprobado';
      default:
        return 'Pendiente';
    }
  }
</script>

<div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        <th
          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10"
        >
          Curso
        </th>
        <th
          class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          Código
        </th>
        {#each Object.values(gradeLabels) as label (label)}
          <th
            class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {label}
          </th>
        {/each}
        <th
          class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50"
        >
          Promedio
        </th>
        <th
          class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          Estado
        </th>
      </tr>
    </thead>
    <tbody class="bg-white divide-y divide-gray-200">
      {#each processedGrades() as course (course.courseCode)}
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
            <div class="text-sm font-medium text-gray-900">
              {course.courseName}
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <div class="text-sm text-gray-500">{course.courseCode}</div>
          </td>
          {#each Object.keys(gradeLabels) as key (key)}
            <td class="px-4 py-4 whitespace-nowrap text-center">
              {#if course.grades[key] !== undefined}
                <span class="text-sm font-semibold text-gray-900">
                  {course.grades[key].toFixed(1)}
                </span>
              {:else}
                <span class="text-sm text-gray-400">-</span>
              {/if}
            </td>
          {/each}
          <td class="px-6 py-4 whitespace-nowrap text-center bg-blue-50">
            <div class="flex items-center justify-center gap-1">
              <span class="text-sm font-bold text-blue-900">
                {course.average.toFixed(1)}
              </span>
              {#if course.average >= 10.5}
                <TrendingUp class="w-4 h-4 text-green-600" />
              {:else if course.average > 0}
                <TrendingDown class="w-4 h-4 text-red-600" />
              {/if}
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <span
              class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(
                course.status,
              )}"
            >
              {getStatusLabel(course.status)}
            </span>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

{#if processedGrades().length === 0}
  <div
    class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center"
  >
    <p class="text-yellow-800">No hay calificaciones registradas.</p>
  </div>
{/if}
