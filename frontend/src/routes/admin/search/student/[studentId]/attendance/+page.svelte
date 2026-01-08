<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { CalendarDays, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-svelte";
  
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  
  const attendanceList = $derived(data.attendance ?? []);

  const stats = $derived.by(() => {
    if (attendanceList.length === 0) return null;
    const sorted = [...attendanceList].sort((a, b) => b.percentage - a.percentage);
    return {
        best: sorted[0],
        worst: sorted[sorted.length - 1]
    };
  });

  // Colores de texto usando semántica de Shadcn y Tailwind
  const getStatusTextColor = (percentage: number) => {
    if (percentage >= 85) return "text-green-600 dark:text-green-500";
    if (percentage >= 70) return "text-yellow-600 dark:text-yellow-500";
    return "text-destructive";
  };

  // Colores de fondo para barras de progreso
  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 85) return "bg-green-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-destructive";
  };
</script>

<svelte:head>
  <title>Asistencia - Sisacad</title>
</svelte:head>

<div class="container mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
  
  <div class="flex items-center gap-2">
    <CalendarDays class="h-6 w-6 text-primary" />
    <h2 class="text-2xl font-bold tracking-tight">Reporte de Asistencia Real</h2>
  </div>

  {#if data.attendance === null}
    <div class="p-6 border border-destructive/20 bg-destructive/10 rounded-lg text-destructive">
        <p class="font-bold">Error de Conexión</p>
        <p class="text-sm">No se pudo obtener la información del servidor. Revisa si el backend está encendido.</p>
    </div>
  {:else if attendanceList.length === 0}
     <div class="p-12 text-center border rounded-lg bg-muted/20">
        <p class="text-muted-foreground font-medium">El estudiante no tiene cursos matriculados o no hay registros de asistencia aún.</p>
     </div>
  {:else if stats}
    
    <div class="grid gap-6 md:grid-cols-2">
      <Card.Root class="bg-green-50/50 border-green-200/50 dark:bg-green-950/20 dark:border-green-900/30 shadow-sm">
        <Card.Header class="pb-2">
          <Card.Title class="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
            <TrendingUp class="h-4 w-4" /> Mayor Asistencia
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="flex justify-between items-end">
            <div>
                <p class="text-lg font-bold text-foreground">{stats.best.name}</p>
                <p class="text-xs text-muted-foreground uppercase tracking-wider">{stats.best.code}</p>
            </div>
            <div class="text-3xl font-extrabold text-green-600 dark:text-green-500">
                {stats.best.percentage}%
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <Card.Root class={stats.worst.percentage < 70 
        ? "bg-destructive/5 border-destructive/10 shadow-sm" 
        : "bg-yellow-50/50 border-yellow-200/50 dark:bg-yellow-950/20 shadow-sm"}>
        <Card.Header class="pb-2">
          <Card.Title class={`text-sm font-medium flex items-center gap-2 ${stats.worst.percentage < 70 ? "text-destructive" : "text-yellow-700 dark:text-yellow-400"}`}>
            <AlertCircle class="h-4 w-4" /> Menor Asistencia
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="flex justify-between items-end">
            <div>
                <p class="text-lg font-bold text-foreground">{stats.worst.name}</p>
                <p class="text-xs text-muted-foreground uppercase tracking-wider">{stats.worst.code}</p>
            </div>
            <div class={`text-3xl font-extrabold ${stats.worst.percentage < 70 ? "text-destructive" : "text-yellow-600 dark:text-yellow-500"}`}>
                {stats.worst.percentage}%
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>

    <Card.Root>
      <Card.Header>
          <Card.Title>Detalle por Curso</Card.Title>
          <Card.Description>Cumplimiento de asistencia del semestre actual.</Card.Description>
      </Card.Header>
      <Card.Content class="p-0">
          <div class="overflow-x-auto">
              <Table.Root>
                  <Table.Header class="bg-muted/30">
                      <Table.Row>
                          <Table.Head class="min-w-[200px]">Curso</Table.Head>
                          <Table.Head class="text-center w-[120px]">Estado</Table.Head>
                          <Table.Head class="min-w-[200px]">Progreso</Table.Head>
                          <Table.Head class="text-center w-24">Presentes</Table.Head>
                          <Table.Head class="text-center w-24">Ausentes</Table.Head>
                      </Table.Row>
                  </Table.Header>
                  <Table.Body>
                      {#each attendanceList as item}
                          <Table.Row class="hover:bg-muted/30 transition-colors">
                              <Table.Cell>
                                  <div class="flex flex-col">
                                      <span class="font-semibold text-foreground">{item.name}</span>
                                      <span class="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{item.code}</span>
                                  </div>
                              </Table.Cell>
                              
                              <Table.Cell class="text-center">
                                  {#if item.percentage >= 85}
                                      <Badge variant="outline" class="bg-green-100/50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">Excelente</Badge>
                                  {:else if item.percentage >= 70}
                                      <Badge variant="outline" class="bg-yellow-100/50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">Regular</Badge>
                                  {:else}
                                      <Badge variant="destructive" class="font-semibold shadow-none">En Riesgo</Badge>
                                  {/if}
                              </Table.Cell>

                              <Table.Cell>
                                  <div class="flex items-center gap-3 w-full">
                                      <div class="h-2 w-full bg-muted rounded-full overflow-hidden">
                                          <div 
                                              class="h-full rounded-full transition-all duration-1000 ease-in-out {getProgressBgColor(item.percentage)}"
                                              style="width: {item.percentage}%;"
                                          ></div>
                                      </div>
                                      <span class={`text-xs font-bold w-10 text-right ${getStatusTextColor(item.percentage)}`}>
                                          {item.percentage}%
                                      </span>
                                  </div>
                              </Table.Cell>

                              <Table.Cell class="text-center">
                                  <div class="flex items-center justify-center gap-1.5 font-semibold text-green-600 dark:text-green-500">
                                      <CheckCircle2 class="h-3.5 w-3.5" /> {item.present}
                                  </div>
                              </Table.Cell>
                              <Table.Cell class="text-center">
                                  <div class="flex items-center justify-center gap-1.5 font-semibold text-destructive">
                                      <AlertCircle class="h-3.5 w-3.5" /> {item.absent}
                                  </div>
                              </Table.Cell>
                          </Table.Row>
                      {/each}
                  </Table.Body>
              </Table.Root>
          </div>
      </Card.Content>
    </Card.Root>
  {/if}
</div>