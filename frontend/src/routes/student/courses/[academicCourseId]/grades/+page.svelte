<script lang="ts">
  import type { PageData, LayoutData } from "./$types";
  import { AlertCircle } from "@lucide/svelte";
  import * as Card from "$lib/components/ui/card";

  import type { GradesAndSchemeDTO } from "$lib/types/enrollment.types";
  import GradeSummary from "$tables/student/GradeSummary.svelte";
  import GradeDetailsTable from "$tables/student/GradeDetailsTable.svelte";

  let { data }: { data: PageData & LayoutData } = $props();

  const gradeData: GradesAndSchemeDTO = data.grades;
  const error = data.error;
  const courseName = data.courseDetails?.course?.name ?? "Curso";

  const gradeLabels: Record<string, string> = {
    firstContinue: "Continua 1",
    secondContinue: "Continua 2",
    thirdContinue: "Continua 3",
    firstPartial: "Parcial 1",
    secondPartial: "Parcial 2",
    thirdPartial: "Parcial 3",
  };

  const finalGrade = $derived(() => {
    if (!gradeData?.grades || !gradeData?.scheme) return 0;

    let total = 0;
    for (const key in gradeData.grades) {
      if (Object.prototype.hasOwnProperty.call(gradeData.grades, key)) {
        const grade =
          gradeData.grades[key as keyof typeof gradeData.grades] ?? 0;
        const weight =
          (gradeData.scheme[key as keyof typeof gradeData.scheme] ?? 0) / 100;
        total += grade * weight;
      }
    }
    return total;
  });

  const gradeDetails = $derived(() => {
    if (!gradeData?.grades || !gradeData?.scheme) return [];
    return Object.keys(gradeLabels).map((key) => {
      return {
        label: gradeLabels[key],
        score: gradeData.grades[key as keyof typeof gradeData.grades] ?? "-",
        weight: gradeData.scheme[key as keyof typeof gradeData.scheme] ?? 0,
      };
    });
  });
</script>

<svelte:head>
  <title>Mis Notas: {courseName} - Sisacad</title>
</svelte:head>

<div class="space-y-6">
  {#if error}
    <div
      class="text-destructive-foreground flex items-center rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm"
      role="alert"
    >
      <AlertCircle class="mr-3 h-5 w-5 flex-shrink-0" />
      <div>
        <span class="font-medium">Error:</span>
        {error}
      </div>
    </div>
  {:else if gradeData}
    <Card.Root>
      <Card.Header>
        <Card.Title>Resumen de Calificaciones</Card.Title>
        <Card.Description>
          Tu promedio actual y el detalle de tus notas para el curso.
        </Card.Description>
      </Card.Header>
      <Card.Content class="space-y-8">
        <GradeSummary {finalGrade} />
        <GradeDetailsTable {gradeDetails} />
      </Card.Content>
    </Card.Root>
  {:else}
    <Card.Root class="text-center">
      <Card.Content class="p-6">
        <p class="text-muted-foreground">
          Aún no se han registrado notas para este curso.
        </p>
      </Card.Content>
    </Card.Root>
  {/if}
</div>
