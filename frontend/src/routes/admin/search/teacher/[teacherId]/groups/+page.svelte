<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Users, BookOpen, Layers, ChevronDown, CheckCircle2, GraduationCap } from "lucide-svelte";
  
  let { data } = $props();
  const allGroups = $derived(data.groups ?? []);
  
  const currentPeriod = "2025-B"; 

  const periods = $derived([...new Set(allGroups.map(g => g.academicPeriod))]
    .filter(p => p !== currentPeriod) // Opcional: quitar el actual de la lista del historial
    .sort()
    .reverse());
  
  let selectedPeriod = $state(periods[0] || "");

  const currentGroups = $derived(allGroups.filter(g => g.academicPeriod === currentPeriod));
  console.log(currentGroups);
  const pastGroups = $derived(allGroups.filter(g => g.academicPeriod === selectedPeriod));
  console.log(pastGroups);
</script>

<div class="container mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
  
  <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
    <div class="space-y-2">
      <div class="flex items-center gap-2 text-primary">
        <Users class="h-8 w-8" />
        <h1 class="text-3xl font-extrabold tracking-tight">Carga Académica</h1>
      </div>
      <p class="text-muted-foreground text-lg italic">
        Docente: <span class="text-foreground font-semibold not-italic">{data.teacherProfile?.firstName} {data.teacherProfile?.lastName}</span>
      </p>
    </div>
  </header>

  <section class="space-y-6">
    <div class="flex items-center gap-2 text-primary font-bold">
      <Layers class="h-6 w-6" />
      <h2 class="text-xl">Grupos del Semestre Actual ({currentPeriod})</h2>
    </div>

    {#if currentGroups.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {#each currentGroups as group}
          <Card.Root class="group transition-all hover:shadow-lg border-t-4 border-t-primary overflow-hidden">
            <Card.Header class="pb-3 bg-muted/5">
              <div class="flex justify-between items-start">
                <Badge variant="secondary" class="font-mono">{group.courseCode}</Badge>
                <span class="text-xs font-bold text-muted-foreground uppercase">Ciclo {group.semester}</span>
              </div>
              <Card.Title class="text-lg leading-tight mt-3">{group.courseName}</Card.Title>
            </Card.Header>
            <Card.Content class="pt-4 space-y-4">
              <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground flex items-center gap-1">
                      <GraduationCap class="h-4 w-4" /> Grupo:
                  </span>
                  <span class="font-bold text-primary text-lg">{group.groupName}</span>
              </div>
              <div class="flex items-center justify-between text-sm border-t pt-3">
                  <span class="text-muted-foreground">Estudiantes matriculados:</span>
                  <Badge variant="outline" class="rounded-full px-3">{group.studentCount}</Badge>
              </div>
            </Card.Content>
          </Card.Root>
        {/each}
      </div>
    {:else}
      <p class="text-muted-foreground italic">No hay grupos asignados para el periodo actual.</p>
    {/if}
  </section>

  <section class="space-y-6 pt-10 border-t">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-muted-foreground font-bold">
        <BookOpen class="h-6 w-6" />
        <h2 class="text-xl">Historial de Grupos</h2>
      </div>

      {#if periods.length > 0}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            {#snippet child({ props })}
              <Button {...props} variant="outline" class="w-full sm:w-[250px] justify-between">
                {selectedPeriod ? `Periodo ${selectedPeriod}` : "Seleccionar periodo"}
                <ChevronDown class="h-4 w-4 opacity-50" />
              </Button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-[250px]">
            {#each periods as period}
              <DropdownMenu.Item onclick={() => selectedPeriod = period} class="justify-between">
                Periodo {period}
                {#if selectedPeriod === period}
                  <CheckCircle2 class="h-4 w-4 text-primary" />
                {/if}
              </DropdownMenu.Item>
            {/each}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      {/if}
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each pastGroups as group}
        <Card.Root class="opacity-80 grayscale-[0.5] hover:grayscale-0 transition-all border-l-4 border-l-muted-foreground">
          <Card.Header class="p-4">
            <div class="flex justify-between items-center mb-2">
                <span class="text-[10px] font-bold text-muted-foreground">{group.academicPeriod}</span>
                <Badge variant="outline" class="text-[10px]">Semestre {group.semester}</Badge>
            </div>
            <Card.Title class="text-base">{group.courseName}</Card.Title>
            <Card.Description>Grupo: {group.groupName}</Card.Description>
          </Card.Header>
        </Card.Root>
      {:else}
        <p class="text-muted-foreground italic col-span-full text-center py-10">
          Selecciona un periodo del historial para ver los grupos.
        </p>
      {/each}
    </div>
  </section>
</div>