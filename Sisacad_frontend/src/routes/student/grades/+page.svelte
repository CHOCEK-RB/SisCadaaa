<script lang="ts">
  import type { PageData } from "./$types";
  import { AlertCircle, Download, FileText } from "lucide-svelte";
  import GradesTable from "$lib/components/GradesTable.svelte";
  import GradesStatistics from "$lib/components/GradesStatistics.svelte";
  import GradesChart from "$lib/components/GradesChart.svelte";
  import { Button } from "$lib/components/ui/button";

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
        Curso: item.course.course?.name || "N/A",
        Código: item.course.course?.code || "N/A",
        C1: grades.firstContinue || "-",
        C2: grades.secondContinue || "-",
        C3: grades.thirdContinue || "-",
        P1: grades.firstPartial || "-",
        P2: grades.secondPartial || "-",
        P3: grades.thirdPartial || "-",
      };
    });

    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map((row) => Object.values(row).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `calificaciones_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
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
    class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
  >
    <div>
      <h1 class="text-3xl font-bold text-foreground">Mis Calificaciones</h1>
      <p class="mt-1 text-muted-foreground">
        Historial completo de rendimiento académico
      </p>
    </div>
    <div class="flex gap-2 print:hidden">
      <Button
        variant="secondary"
        onclick={handleExport}
        disabled={allGrades.length === 0}
      >
        <FileText class="h-4 w-4" />
        Exportar CSV
      </Button>
      <Button onclick={handlePrint} disabled={allGrades.length === 0}>
        <Download class="h-4 w-4" />
        Imprimir
      </Button>
    </div>
  </div>

  {#if error}
    <div
      class="mb-6 flex items-center rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      role="alert"
    >
      <AlertCircle class="mr-3 h-5 w-5 flex-shrink-0" />
      <div>
        <span class="font-medium">Error:</span>
        {error}
      </div>
    </div>
  {:else if allGrades && allGrades.length > 0}
    <div class="mb-8 print:break-inside-avoid">
      <h2 class="mb-4 text-xl font-semibold text-foreground">
        Resumen General
      </h2>
      <GradesStatistics gradesData={allGrades} />
    </div>

    <div class="mb-8 print:break-before-page">
      <h2 class="mb-4 text-xl font-semibold text-foreground">
        Análisis de Rendimiento
      </h2>
      <GradesChart gradesData={allGrades} />
    </div>

    <div class="print:break-before-page">
      <h2 class="mb-4 text-xl font-semibold text-foreground">
        Calificaciones Detalladas
      </h2>
      <GradesTable gradesData={allGrades} />
    </div>

    <div
      class="mt-6 rounded-lg border bg-accent p-4 text-accent-foreground print:break-inside-avoid"
    >
      <h3 class="mb-2 font-semibold">Información Importante</h3>
      <ul class="space-y-1 text-sm">
        <li>• <strong>C1, C2, C3:</strong> Evaluaciones continuas</li>
        <li>• <strong>P1, P2, P3:</strong> Exámenes parciales</li>
        <li>• <strong>Nota mínima aprobatoria:</strong> 10.5</li>
        <li>• Los promedios se calculan según el peso de cada evaluación</li>
      </ul>
    </div>
  {:else}
    <div class="rounded-lg border bg-white p-8 text-center shadow-md">
      <FileText class="mx-auto mb-4 h-16 w-16 text-gray-400" />
      <p class="mb-2 text-lg text-gray-600">
        No tienes calificaciones registradas
      </p>
      <p class="text-sm text-gray-500">
        Las calificaciones aparecerán aquí una vez que tus profesores las
        registren
      </p>
    </div>
  {/if}
</div>
