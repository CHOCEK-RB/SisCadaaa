<script lang="ts">
  import type { PageData } from './$types';
  import { AlertCircle, Download, FileText } from 'lucide-svelte';
  import GradesTable from '$lib/components/GradesTable.svelte';
  import GradesStatistics from '$lib/components/GradesStatistics.svelte';
  import GradesChart from '$lib/components/GradesChart.svelte';

  export let data: PageData;
  const allGrades = data.allGrades || [];
  const error = data.error;

  function handlePrint() {
    window.print();
  }

  function handleExport() {
    const csvData = allGrades.map((item) => {
      const grades = item.grades;
      return {
        Curso: item.course.course?.name || 'N/A',
        Código: item.course.course?.code || 'N/A',
        C1: grades.firstContinue || '-',
        C2: grades.secondContinue || '-',
        C3: grades.thirdContinue || '-',
        P1: grades.firstPartial || '-',
        P2: grades.secondPartial || '-',
        P3: grades.thirdPartial || '-',
      };
    });

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map((row) => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `calificaciones_${new Date().toISOString().split('T')[0]}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<svelte:head>
  <title>Mis Calificaciones - Sisacad</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div
    class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
  >
    <div>
      <h1 class="text-3xl font-bold text-gray-800">Mis Calificaciones</h1>
      <p class="text-gray-600 mt-1">
        Historial completo de rendimiento académico
      </p>
    </div>
    <div class="flex gap-2 print:hidden">
      <button
        onclick={handleExport}
        class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        disabled={allGrades.length === 0}
      >
        <FileText class="w-4 h-4" />
        Exportar CSV
      </button>
      <button
        onclick={handlePrint}
        class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        disabled={allGrades.length === 0}
      >
        <Download class="w-4 h-4" />
        Imprimir
      </button>
    </div>
  </div>

  {#if error}
    <div
      class="flex items-center p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200"
      role="alert"
    >
      <AlertCircle class="w-5 h-5 mr-3 flex-shrink-0" />
      <div>
        <span class="font-medium">Error:</span>
        {error}
      </div>
    </div>
  {:else if allGrades && allGrades.length > 0}
    <div class="mb-8 print:break-inside-avoid">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Resumen General</h2>
      <GradesStatistics gradesData={allGrades} />
    </div>

    <div class="mb-8 print:break-before-page">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">
        Análisis de Rendimiento
      </h2>
      <GradesChart gradesData={allGrades} />
    </div>

    <div class="print:break-before-page">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">
        Calificaciones Detalladas
      </h2>
      <GradesTable gradesData={allGrades} />
    </div>

    <div
      class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg print:break-inside-avoid"
    >
      <h3 class="font-semibold text-blue-900 mb-2">Información Importante</h3>
      <ul class="text-sm text-blue-800 space-y-1">
        <li>• <strong>C1, C2, C3:</strong> Evaluaciones continuas</li>
        <li>• <strong>P1, P2, P3:</strong> Exámenes parciales</li>
        <li>• <strong>Nota mínima aprobatoria:</strong> 10.5</li>
        <li>• Los promedios se calculan según el peso de cada evaluación</li>
      </ul>
    </div>
  {:else}
    <div class="bg-white p-8 rounded-lg shadow-md border text-center">
      <FileText class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <p class="text-gray-600 text-lg mb-2">
        No tienes calificaciones registradas
      </p>
      <p class="text-gray-500 text-sm">
        Las calificaciones aparecerán aquí una vez que tus profesores las
        registren
      </p>
    </div>
  {/if}
</div>
