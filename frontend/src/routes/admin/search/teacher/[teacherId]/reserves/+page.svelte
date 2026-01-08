<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { 
    Calendar, 
    Clock, 
    History, 
    ChevronDown, 
    CheckCircle2, 
    MapPin, 
    AlertCircle,
    CalendarDays
  } from "lucide-svelte";
  
  let { data } = $props();
  const reserves = $derived(data.reserves ?? []);
  
  /** * Lógica de Periodo Actual:
   * Si estamos en Enero (0), el periodo vigente sigue siendo el "B" del año anterior.
   */
  const getCurrentPeriod = () => {
    const now = new Date(); // Asumiendo hoy 07/01/2026
    let year = now.getFullYear();
    const month = now.getMonth();

    if (month <= 1) { // Enero o Febrero
      return `${year - 1}-B`;
    }
    return month >= 2 && month <= 6 ? `${year}-A` : `${year}-B`;
  };

  const currentPeriod = getCurrentPeriod(); 

  // Agrupación de periodos únicos para el menú
  const periods = $derived([...new Set(reserves.map(r => r.academicPeriod))].sort().reverse());
  
  // Estado para el selector (inicializa con el periodo actual o el último disponible)
  let selectedPeriod = $state(currentPeriod);

  const currentReserves = $derived(reserves.filter(r => r.academicPeriod === currentPeriod));
  console.log(currentReserves)
  const filteredPastReserves = $derived(
    reserves.filter(r => r.academicPeriod === selectedPeriod && r.academicPeriod !== currentPeriod)
  );
</script>

<div class="container mx-auto p-4 md:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
  
  <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
    <div class="space-y-2">
      <div class="flex items-center gap-2 text-primary">
        <CalendarDays class="h-8 w-8" />
        <h1 class="text-3xl font-extrabold tracking-tight">Gestión de Reservas</h1>
      </div>
      <p class="text-muted-foreground text-lg">
        Historial del Docente: <span class="text-foreground font-semibold">{data.teacherProfile?.firstName} {data.teacherProfile?.lastName}</span>
      </p>
    </div>
    
    <Badge variant="secondary" class="w-fit text-sm px-4 py-1 h-fit">
        Ciclo Lectivo Activo: {currentPeriod}
    </Badge>
  </header>

  <section class="space-y-6">
    <div class="flex items-center gap-2 text-primary">
      <Clock class="h-6 w-6" />
      <h2 class="text-xl font-bold">Reservas del Semestre Actual ({currentPeriod})</h2>
    </div>

    {#if currentReserves.length === 0}
      <Card.Root class="bg-muted/20 border-dashed shadow-none py-10">
        <Card.Content class="flex flex-col items-center justify-center text-muted-foreground">
          <Calendar class="h-10 w-10 mb-2 opacity-20" />
          <p>No se encontraron reservaciones para el periodo vigente.</p>
        </Card.Content>
      </Card.Root>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each currentReserves as res}
          {@const isActive = res.status === 'active'}
          <Card.Root class="overflow-hidden transition-all hover:ring-2 hover:ring-primary/20 border-l-8 {isActive ? 'border-l-emerald-500 bg-emerald-50/10' : 'border-l-destructive bg-destructive/5'}">
            <Card.Header class="pb-3">
              <div class="flex justify-between items-start">
                <Badge variant={isActive ? "default" : "destructive"} class="uppercase text-[10px] font-bold {isActive ? 'bg-emerald-600 hover:bg-emerald-700' : ''}">
                    {isActive ? 'Activa' : 'Cancelada'}
                </Badge>
                {#if isActive}
                    <CheckCircle2 class="h-5 w-5 text-emerald-600" />
                {:else}
                    <AlertCircle class="h-5 w-5 text-destructive" />
                {/if}
              </div>
              <Card.Title class="text-xl font-bold mt-3 flex items-center gap-2">
                <MapPin class="h-4 w-4 opacity-50" />
                Aula: {res.classroomName}
              </Card.Title>
            </Card.Header>
            <Card.Content class="space-y-3">
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar class="h-4 w-4" />
                <span>{new Date(res.startTime).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div class="p-3 bg-background rounded-md border text-sm font-medium flex justify-between items-center shadow-sm">
                <span class="opacity-60">Horario:</span>
                <span class="text-primary font-bold">
                    {new Date(res.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(res.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </Card.Content>
          </Card.Root>
        {/each}
      </div>
    {/if}
  </section>

  <section class="space-y-6 pt-10 border-t">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-muted-foreground font-bold">
        <History class="h-6 w-6" />
        <h2 class="text-xl">Periodos Académicos Anteriores</h2>
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          {#snippet child({ props })}
            <Button {...props} variant="outline" class="w-full sm:w-[250px] justify-between shadow-sm bg-background">
              <span class="flex items-center gap-2 font-semibold text-primary">
                <History class="h-4 w-4" />
                {selectedPeriod}
              </span>
              <ChevronDown class="h-4 w-4 opacity-50" />
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-[250px]" align="end">
          <DropdownMenu.Label>Seleccionar Historial</DropdownMenu.Label>
          <DropdownMenu.Separator />
          {#each periods as period}
            <DropdownMenu.Item onmousedown={() => selectedPeriod = period} class="justify-between">
              {period}
              {#if selectedPeriod === period}
                <CheckCircle2 class="h-4 w-4 text-primary" />
              {/if}
            </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredPastReserves as res}
        {@const isActive = res.status === 'active'}
        <Card.Root class="shadow-sm border-t-4 transition-transform hover:-translate-y-1 {isActive ? 'border-t-emerald-500' : 'border-t-destructive bg-destructive/5'}">
          <Card.Header class="pb-2">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-mono text-muted-foreground uppercase">Reserva de clase</span>
                <Badge variant="secondary" class="text-[10px]">{res.academicPeriod}</Badge>
            </div>
            <Card.Title class="text-lg font-bold">Aula: {res.classroomName}</Card.Title>
            <Card.Description class="font-medium text-foreground/80">
                {new Date(res.startTime).toLocaleDateString()}
            </Card.Description>
          </Card.Header>
          <Card.Content class="pt-0">
             <div class="mt-4 flex items-center justify-between">
                <div class="text-sm font-bold text-muted-foreground">
                    {new Date(res.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}-{new Date(res.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <Badge variant={isActive ? "outline" : "destructive"} class={isActive ? "border-emerald-200 text-emerald-700 bg-emerald-50" : ""}>
                    {isActive ? "Completada" : "Cancelada"}
                </Badge>
             </div>
          </Card.Content>
        </Card.Root>
      {/each}

      {#if filteredPastReserves.length === 0 && selectedPeriod !== currentPeriod}
        <div class="col-span-full p-20 text-center border-2 border-dashed rounded-2xl bg-muted/10">
            <p class="text-muted-foreground italic font-medium">No se encontraron registros para el periodo seleccionado.</p>
        </div>
      {/if}
    </div>
  </section>
</div>

<style>
  :global(.animate-in) {
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>