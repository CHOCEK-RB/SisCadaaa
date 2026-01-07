<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { 
    History, 
    Clock, 
    GraduationCap, 
    ChevronDown, 
    CheckCircle2, 
    AlertCircle,
    Search
  } from "lucide-svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const student = $derived(data.studentProfile);
  const enrollments = $derived(data.enrollments ?? []);

  // --- LÓGICA DE FILTRADO ---

  // 1. Cursos del Semestre Actual (Fijo)
  const currentCourses = $derived(
    enrollments.filter(e => e.course.semester === student?.semester)
  );

  // 2. Agrupar semestres pasados para el menú
  const pastSemesters = $derived(
    [...new Set(enrollments
      .filter(e => e.course.semester < (student?.semester ?? 0))
      .map(e => e.course.semester)
    )].sort((a, b) => b - a) // De mayor a menor
  );

  
  let selectedSemester = $state<number | null>(null);

  // Efecto para inicializar el semestre al cargar los datos
  $effect(() => {
    if (selectedSemester === null && pastSemesters.length > 0) {
      selectedSemester = pastSemesters[0]; // El anterior inmediato
    }
  });

  // Cursos a mostrar basados en la selección
  const filteredPastCourses = $derived(
    enrollments.filter(e => e.course.semester === selectedSemester)
  );

  // Helper de Notas
  const getFinalGrade = (item: any) => {
    const g = item.grades;
    const p = item.percent;
    if (!g || !p) return 0;
    const score = (
      ((g.firstContinue ?? 0) * (p.firstContinue ?? 0) / 100) +
      ((g.secondContinue ?? 0) * (p.secondContinue ?? 0) / 100) +
      ((g.thirdContinue ?? 0) * (p.thirdContinue ?? 0) / 100) +
      ((g.firstPartial ?? 0) * (p.firstPartial ?? 0) / 100) +
      ((g.secondPartial ?? 0) * (p.secondPartial ?? 0) / 100) +
      ((g.thirdPartial ?? 0) * (p.thirdPartial ?? 0) / 100)
    );
    return parseFloat(score.toFixed(1));
  };
</script>

<div class="container mx-auto p-6 space-y-10 animate-in fade-in duration-500">
  
  <header class="flex flex-col gap-2 pb-6 border-b">
    <div class="flex items-center gap-3 text-primary">
        <div class="p-2 bg-primary/10 rounded-lg">
            <GraduationCap class="h-8 w-8" />
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Historial Académico</h1>
    </div>
    <p class="text-muted-foreground">Expediente de: <span class="text-foreground font-semibold">{student?.firstName} {student?.lastName}</span></p>
  </header>

  <section class="space-y-4">
    <div class="flex items-center gap-2 text-primary font-bold text-lg">
      <Clock class="h-5 w-5" />
      <h2>Ciclo Actual ({student?.semester}° Semestre)</h2>
    </div>

    {#if currentCourses.length === 0}
      <div class="p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
        No hay carga académica para el semestre vigente.
      </div>
    {:else}
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each currentCourses as item}
          {@const score = getFinalGrade(item)}
          {@const ok = score >= 10.5}
          <Card.Root class="border-l-4 {ok ? 'border-l-green-500 bg-green-50/20' : 'border-l-destructive bg-destructive/5'}">
            <Card.Header class="pb-2">
              <div class="flex justify-between items-start mb-2">
                <Badge variant="outline" class={ok ? 'text-green-700 border-green-200 bg-green-100/50' : 'text-destructive border-destructive/20 bg-destructive/10'}>
                    En curso
                </Badge>
                <CheckCircle2 class="h-4 w-4 {ok ? 'text-green-600' : 'text-muted-foreground/30'}" />
              </div>
              <Card.Title class="text-base font-bold">{item.course.course.name}</Card.Title>
              <Card.Description class="text-xs">{item.course.course.code}</Card.Description>
            </Card.Header>
            <Card.Content>
                <div class="flex justify-between items-center text-sm">
                    <span class="opacity-70">Nota Parcial:</span>
                    <span class="font-bold {ok ? 'text-green-600' : 'text-destructive'}">{score}</span>
                </div>
            </Card.Content>
          </Card.Root>
        {/each}
      </div>
    {/if}
  </section>

  <section class="space-y-6 pt-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-muted-foreground font-bold text-lg">
            <History class="h-5 w-5" />
            <h2>Antecedentes Académicos</h2>
        </div>

        <div class="flex items-center gap-2">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    {#snippet child({ props })}
                        <Button {...props} variant="outline" class="w-[240px] justify-between shadow-sm bg-background">
                            <div class="flex items-center gap-2">
                                <Search class="h-4 w-4 text-muted-foreground" />
                                <span>{selectedSemester ? `Semestre ${selectedSemester}` : 'Seleccionar Periodo'}</span>
                            </div>
                            <ChevronDown class="h-4 w-4 opacity-50" />
                        </Button>
                    {/snippet}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="w-[240px]" align="end">
                    <DropdownMenu.Label>Periodos Anteriores</DropdownMenu.Label>
                    <DropdownMenu.Separator />
                    {#each pastSemesters as sem}
                        <DropdownMenu.Item onmousedown={() => selectedSemester = sem} class="justify-between">
                            Semestre {sem}
                            {#if selectedSemester === sem}
                                <CheckCircle2 class="h-3 w-3 text-primary" />
                            {/if}
                        </DropdownMenu.Item>
                    {/each}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    </div>

    {#if pastSemesters.length === 0}
        <div class="p-12 text-center text-muted-foreground border rounded-xl bg-muted/10">
            Este estudiante no cuenta con historial de semestres anteriores.
        </div>
    {:else}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each filteredPastCourses as item}
                {@const score = getFinalGrade(item)}
                {@const ok = score >= 10.5}
                <Card.Root class="border-t-4 transition-all hover:shadow-md {ok ? 'border-t-green-500' : 'border-t-destructive bg-destructive/5'}">
                    <Card.Header class="pb-2">
                        <div class="flex justify-between items-start">
                            <Card.Title class="text-base font-bold pr-8">{item.course.course.name}</Card.Title>
                            <Badge variant={ok ? 'default' : 'destructive'} class="text-[10px] uppercase {ok ? 'bg-green-600' : ''}">
                                {ok ? 'Aprobado' : 'Reprobado'}
                            </Badge>
                        </div>
                        <Card.Description class="text-xs uppercase font-mono">{item.course.course.code}</Card.Description>
                    </Card.Header>
                    <Card.Content class="pt-2">
                        <div class="flex justify-between items-end border-t pt-3 mt-1">
                            <div class="flex flex-col">
                                <span class="text-[9px] font-bold text-muted-foreground uppercase">Calificación Final</span>
                                <span class="text-2xl font-black {ok ? 'text-green-600' : 'text-destructive'}">{score}</span>
                            </div>
                        </div>
                    </Card.Content>
                </Card.Root>
            {/each}
        </div>
    {/if}
  </section>
</div>