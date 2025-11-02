<script lang="ts">
  import type { GradesAndPercent } from '$lib/services/enrollment.service';
  import { Target, Award, AlertCircle } from 'lucide-svelte';

  export interface CourseAverage {
    name: string;
    average: number;
  }

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

  const statistics = $derived(() => {
    const averages = gradesData
      .map((item: GradesAndPercent) =>
        calculateWeightedAverage(item.grades, item.percent),
      )
      .filter((avg: number) => avg > 0);

    if (averages.length === 0) {
      return {
        generalAverage: 0,
        highestGrade: 0,
        lowestGrade: 0,
        highestCourse: '',
        lowestCourse: '',
        approvedCount: 0,
        failedCount: 0,
        pendingCount: 0,
      };
    }

    const coursesWithAvg = gradesData
      .map((item: GradesAndPercent) => ({
        name: item.course.course?.name || 'Sin nombre',
        average: calculateWeightedAverage(item.grades, item.percent),
      }))
      .filter((c: CourseAverage) => c.average > 0);

    const highest = coursesWithAvg.reduce(
      (max: CourseAverage, course: CourseAverage) =>
        course.average > max.average ? course : max,
    );

    const lowest = coursesWithAvg.reduce(
      (min: CourseAverage, course: CourseAverage) =>
        course.average < min.average ? course : min,
    );

    const generalAverage =
      averages.reduce((sum: number, avg: number) => sum + avg, 0) /
      averages.length;

    const approvedCount = averages.filter((avg: number) => avg >= 10.5).length;
    const failedCount = averages.filter(
      (avg: number) => avg < 10.5 && avg > 0,
    ).length;
    const pendingCount = gradesData.length - averages.length;

    return {
      generalAverage: Math.round(generalAverage * 10) / 10,
      highestGrade: highest.average,
      lowestGrade: lowest.average,
      highestCourse: highest.name,
      lowestCourse: lowest.name,
      approvedCount,
      failedCount,
      pendingCount,
    };
  });
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div
    class="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6 shadow-sm"
  >
    <div class="flex items-center justify-between mb-2">
      <Target class="w-8 h-8 text-blue-600" />
      <span class="text-3xl font-bold text-blue-900">
        {statistics().generalAverage.toFixed(1)}
      </span>
    </div>
    <p class="text-sm font-medium text-blue-700">Promedio General</p>
  </div>

  <div
    class="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-6 shadow-sm"
  >
    <div class="flex items-center justify-between mb-2">
      <Award class="w-8 h-8 text-green-600" />
      <span class="text-3xl font-bold text-green-900">
        {statistics().highestGrade.toFixed(1)}
      </span>
    </div>
    <p class="text-sm font-medium text-green-700">Nota Más Alta</p>
    {#if statistics().highestCourse}
      <p
        class="text-xs text-green-600 mt-1 truncate"
        title={statistics().highestCourse}
      >
        {statistics().highestCourse}
      </p>
    {/if}
  </div>

  <div
    class="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-6 shadow-sm"
  >
    <div class="flex items-center justify-between mb-2">
      <AlertCircle class="w-8 h-8 text-red-600" />
      <span class="text-3xl font-bold text-red-900">
        {statistics().lowestGrade.toFixed(1)}
      </span>
    </div>
    <p class="text-sm font-medium text-red-700">Nota Más Baja</p>
    {#if statistics().lowestCourse}
      <p
        class="text-xs text-red-600 mt-1 truncate"
        title={statistics().lowestCourse}
      >
        {statistics().lowestCourse}
      </p>
    {/if}
  </div>

  <!-- Estado de Cursos -->
  <div
    class="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-6 shadow-sm"
  >
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-purple-700">Aprobados</span>
        <span class="text-sm font-bold text-green-700"
          >{statistics().approvedCount}</span
        >
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-purple-700">Reprobados</span>
        <span class="text-sm font-bold text-red-700"
          >{statistics().failedCount}</span
        >
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-purple-700">Pendientes</span>
        <span class="text-sm font-bold text-gray-700"
          >{statistics().pendingCount}</span
        >
      </div>
    </div>
  </div>
</div>
