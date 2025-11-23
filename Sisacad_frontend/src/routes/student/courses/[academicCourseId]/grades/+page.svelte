<script lang="ts">
  import type { PageData, LayoutData } from "./$types";
  import { AlertCircle } from "lucide-svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import { Progress } from "$lib/components/ui/progress";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { cn } from "$lib/utils";

  let { data }: { data: PageData & LayoutData } = $props();

  const gradeData = data.grades;
  const error = data.error;
  const courseName = data.courseDetails?.course?.name ?? "Curso";

  const PASSING_GRADE = 10.5;

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

  const neededToPass = $derived(() => {
    return Math.max(0, PASSING_GRADE - finalGrade());
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
        <Card.Description
          >Tu promedio actual y el detalle de tus notas para el curso.</Card.Description
        >
      </Card.Header>
      <Card.Content class="space-y-8">
        <!-- Summary Section -->
        <div class="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
          <div class="rounded-lg border bg-card p-4">
            <p class="text-sm font-medium text-muted-foreground">
              Promedio Final
            </p>
            <p
              class={cn(
                "mt-1 text-4xl font-bold",
                finalGrade() >= PASSING_GRADE
                  ? "text-green-500"
                  : "text-red-500",
              )}
            >
              {finalGrade().toFixed(2)}
            </p>
          </div>
          <div class="rounded-lg border bg-card p-4">
            <p class="text-sm font-medium text-muted-foreground">Estado</p>
            <Badge
              variant={finalGrade() >= PASSING_GRADE
                ? "default"
                : "destructive"}
              class="mt-2 text-lg"
            >
              {finalGrade() >= PASSING_GRADE ? "Aprobado" : "Desaprobado"}
            </Badge>
          </div>
          <div class="rounded-lg border bg-card p-4">
            <p class="text-sm font-medium text-muted-foreground">
              Puntos para Aprobar
            </p>
            <p class="mt-1 text-4xl font-bold text-foreground">
              {neededToPass().toFixed(2)}
            </p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div>
          <Progress value={(finalGrade() / 20) * 100} class="w-full" />
        </div>

        <!-- Details Table -->
        <div>
          <h3 class="mb-4 text-lg font-semibold">Detalle de Notas</h3>
          <div class="rounded-md border">
            <Table.Root class="text-xl">
              <Table.Header>
                <Table.Row>
                  <Table.Head>Evaluación</Table.Head>
                  <Table.Head class="text-center">Peso (%)</Table.Head>
                  <Table.Head class="text-right">Nota</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {#each gradeDetails() as item (item.label)}
                  <Table.Row>
                    <Table.Cell class="font-medium">{item.label}</Table.Cell>
                    <Table.Cell class="text-center">{item.weight}%</Table.Cell>
                    <Table.Cell
                      class={cn("text-right font-bold", {
                        "text-muted-foreground": item.score === "-",
                      })}>{item.score}</Table.Cell
                    >
                  </Table.Row>
                {/each}
              </Table.Body>
            </Table.Root>
          </div>
        </div>
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
