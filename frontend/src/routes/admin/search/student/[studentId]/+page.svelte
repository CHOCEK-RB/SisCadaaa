<script lang="ts">
  import {
    Mail,
    Building2,
    BookOpen,
    GraduationCap,
    CalendarDays,
    ArrowRight,
  } from "lucide-svelte";

  import * as Card from "$lib/components/ui/card";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Separator } from "$lib/components/ui/separator";
  import { Badge } from "$lib/components/ui/badge";

  let { data } = $props();

  const student = $derived(data.studentProfile);
  const anio_ingreso = $derived(
    student?.cui ? student.cui.slice(0, 4) : "2024",
  );

  const initials = $derived(
    student?.firstName && student?.lastName
      ? `${student.firstName[0]}${student.lastName[0]}`.toUpperCase()
      : "",
  );

  const quickActions = $derived([
    {
      title: "Historial Académico",
      description: "Cursos y malla curricular.",
      icon: BookOpen,
      href: `/admin/search/student/${student.id}/academic`,
      color: "text-blue-600 bg-blue-50",
      border: "hover:border-blue-200",
    },
    {
      title: "Notas",
      description: "Registro de calificaciones.",
      icon: GraduationCap,
      href: `/admin/search/student/${student.id}/grades`,
      color: "text-green-600 bg-green-50",
      border: "hover:border-green-200",
    },
    {
      title: "Asistencia",
      description: "Reporte de inasistencias.",
      icon: CalendarDays,
      href: `/admin/search/student/${student.id}/attendance`,
      color: "text-purple-600 bg-purple-50",
      border: "hover:border-purple-200",
    },
  ]);
</script>

{#if student}
  <div class="container mx-auto animate-in space-y-8 p-6 duration-500 fade-in">
    <div class="flex items-center gap-5">
      <Avatar.Root class="h-20 w-20 border-2 border-white shadow-sm">
        <Avatar.Image src={student.pictureURL} alt={student.firstName} />
        <Avatar.Fallback
          class="bg-indigo-100 text-2xl font-bold text-indigo-700"
        >
          {initials}
        </Avatar.Fallback>
      </Avatar.Root>

      <div class="flex flex-col">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">
          {student.firstName}
          {student.lastName}
        </h1>
        <p class="mt-1 flex items-center gap-2 text-muted-foreground">
          <Mail class="h-4 w-4" />
          {student.email}
        </p>

        <div class="mt-3 flex gap-2">
          <Badge variant="outline" class="text-xs font-normal"
            >CUI: {student.cui}</Badge
          >
          <Badge
            class={student.isActive
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-500"}
          >
            {student.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>
    </div>

    <Separator />

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <Card.Root>
          <Card.Header>
            <Card.Title class="flex items-center gap-2 text-lg">
              <Building2 class="h-5 w-5 text-muted-foreground" /> Información Académica
            </Card.Title>
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p class="text-sm font-medium text-muted-foreground">
                  Semestre Actual
                </p>
                <p class="font-medium">{student.semester}° Semestre</p>
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">
                  Año de Ingreso
                </p>
                <p class="font-medium">{anio_ingreso}</p>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      </div>

      <div class="space-y-4">
        <h3 class="px-1 text-lg font-semibold text-foreground">
          Acciones Rápidas
        </h3>
        <div class="flex flex-col gap-3">
          {#each quickActions as action}
            <a href={action.href} class="group block">
              <div
                class="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md {action.border}"
              >
                <div class="flex items-center gap-4 p-4">
                  <div class="rounded-lg p-3 {action.color} shrink-0">
                    <action.icon class="h-6 w-6" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p
                      class="mb-1 text-base leading-none font-semibold transition-colors group-hover:text-primary"
                    >
                      {action.title}
                    </p>
                    <p class="truncate text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight
                    class="h-5 w-5 text-muted-foreground/50 transition-all group-hover:translate-x-1 group-hover:text-primary"
                  />
                </div>
              </div>
            </a>
          {/each}
        </div>
      </div>
    </div>
  </div>
{:else}
  <p>Cargando datos del estudiante...</p>
{/if}

