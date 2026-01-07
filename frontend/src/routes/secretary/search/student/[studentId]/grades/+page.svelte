<script lang="ts">
  import GradesTable from "$lib/components/GradesTable.svelte";
  import GradesStatistics from "$lib/components/GradesStatistics.svelte";
  import GradesChart from "$lib/components/GradesChart.svelte";
  import * as Card from "$lib/components/ui/card";
  import { GraduationCap, BookOpen, BarChart3, Clock } from "lucide-svelte";  
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const student = $derived(data.studentProfile);
  const gradesList = $derived(data.gradesData?.enrollments ?? []);
  console.log("gradesList", gradesList);
  const gpa = $derived.by(() => {
    if (gradesList.length === 0) return 0;
    const sum = gradesList.reduce((acc, curr) => acc + (curr.grades.finalGrade ?? 0), 0);
    return (sum / gradesList.length).toFixed(1);
  });
  console.log("GradeDetailsTable", gradesList);
  console.log("gpa", gpa);
</script>

<div class="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
  
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2 text-primary">
        <GraduationCap class="h-6 w-6" />
        <h1 class="text-2xl font-bold tracking-tight">Historial Academico</h1>
    </div>
    <p class="text-muted-foreground">
        Registro de <strong>{student?.firstName} {student?.lastName}</strong> 
        (Ciclo: {student?.semester}°).
    </p>
  </div>

  {#if !data.gradesData}
    <div class="p-8 border border-destructive/20 bg-destructive/10 rounded-xl text-destructive text-center">
        <p class="font-bold">Sin Datos</p>
        <p class="text-sm text-destructive/80">No se encontraron registros academicos para este ID.</p>
    </div>
  {:else}
    
    <div class="mb-8 print:break-inside-avoid">
      <h2 class="mb-4 text-xl font-semibold text-foreground">
        Resumen General
      </h2>
      <GradesStatistics gradesData={gradesList} />
    </div>
   <div class="mb-8 print:break-before-page">
      <h2 class="mb-4 text-xl font-semibold text-foreground">
        Análisis de Rendimiento
      </h2>
      <GradesChart gradesData={gradesList} />
    </div>
    <div class="print:break-before-page">
      <h2 class="mb-4 text-xl font-semibold text-foreground">
        Detalle Historico
      </h2>
      <GradesTable gradesData={gradesList} />
    </div>
  {/if}
</div>