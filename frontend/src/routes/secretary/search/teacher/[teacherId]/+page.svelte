<script lang="ts">
  import {
    Mail,
    Building2,
    BookOpen,
    GraduationCap,
    CalendarDays,
    ArrowRight
  } from "lucide-svelte";
  
  import * as Card from "$lib/components/ui/card";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Separator } from "$lib/components/ui/separator";
  import { Badge } from "$lib/components/ui/badge";

  let { data } = $props();

  const teacher = $derived(data.teacherProfile);
  const anio_ingreso = $derived(teacher?.cui ? teacher.cui.slice(0, 4) : '2024');

const initials = $derived(
    teacher?.firstName && teacher?.lastName 
      ? `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase() 
      : ""
  );

const quickActions = $derived([
    {
      title: "Historial de Reservas",
      description: "Reservas realizadas",
      icon: BookOpen,
      href: `/secretary/search/teacher/${teacher.id}/reserves`,
      color: "text-blue-600 bg-blue-50",
      border: "hover:border-blue-200"
    },
    {
      title: "Grupos Asignados",
      description: "Registro de Grupos Academicos",
      icon: GraduationCap,
      href: `/secretary/search/teacher/${teacher.id}/groups`,
      color: "text-green-600 bg-green-50",
      border: "hover:border-green-200"
    },
    {
      title: "Horario de Clases",
      description: "Reporte de inasistencias.",
      icon: CalendarDays,
      href: `/secretary/search/teacher/${teacher.id}/schedule`,
      color: "text-purple-600 bg-purple-50",
      border: "hover:border-purple-200"
    }
  ]);
</script>

{#if teacher}
<div class="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
  
  <div class="flex items-center gap-5">
    <Avatar.Root class="h-20 w-20 border-2 border-white shadow-sm">
      <Avatar.Image src={teacher.iconURL} alt={teacher.firstName} />
      <Avatar.Fallback class="bg-indigo-100 text-indigo-700 text-2xl font-bold">
        {initials}
      </Avatar.Fallback>
    </Avatar.Root>

    <div class="flex flex-col">
      <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
        {teacher.firstName} {teacher.lastName}
      </h1>
      <p class="text-muted-foreground flex items-center gap-2 mt-1">
        <Mail class="h-4 w-4" /> {teacher.email}
      </p>
      
      <div class="flex gap-2 mt-3">
         <Badge variant="outline" class="text-xs font-normal">CODIGO: 424324324 </Badge>
         <Badge class={teacher.isActive ? "bg-green-600 hover:bg-green-700" : "bg-gray-500"}>
            {teacher.isActive ? 'Activo' : 'Inactivo'}
         </Badge>
      </div>
    </div>
  </div>

  <Separator />

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-lg flex items-center gap-2">
            <Building2 class="h-5 w-5 text-muted-foreground"/> Información Académica
          </Card.Title>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Escuela Profesional</p>
              <p class="font-medium">Ciencia de la Computacion</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Cargo</p>
              <p class="font-medium">Docente/Investigador</p>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>

    <div class="space-y-4">
      <h3 class="font-semibold text-lg text-foreground px-1">Acciones Rápidas</h3>
      <div class="flex flex-col gap-3">
        {#each quickActions as action}
          <a href={action.href} class="block group">
            <div class="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md {action.border}">
              <div class="p-4 flex items-center gap-4">
                <div class="p-3 rounded-lg {action.color} shrink-0">
                  <action.icon class="h-6 w-6" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-base leading-none mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </p>
                  <p class="text-sm text-muted-foreground truncate">
                    {action.description}
                  </p>
                </div>
                <ArrowRight class="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  </div>
</div>
{:else}
  <p>Cargando datos del docente...</p>
{/if}