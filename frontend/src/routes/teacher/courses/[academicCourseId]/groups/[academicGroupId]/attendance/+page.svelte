<script lang="ts">
  import { attendanceService } from "$lib/services/attendance.service";
  import type { GroupAttendanceRecord } from "$lib/services/attendance.service";
  
  // Importamos componentes de Shadcn UI
  import * as Table from "$lib/components/ui/table";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge"; // Opcional, para estados
  
  import {
    AlertCircle,
    Calendar,
    Download,
    TrendingUp,
    ClipboardList,
    ArrowRight,
    CheckCircle,
    UserX
  } from "lucide-svelte";
  import { onMount } from "svelte";
  import { SvelteMap } from "svelte/reactivity";

  let { data } = $props<{ data: any }>();
  
  // 1. Recuperar IDs corregidos
  const groupId = data.academicGroupId; 
  
  // 2. Datos del Grupo
  const groupInfo = data.groupGrades || {};
  const courseCode = groupInfo.courseCode || "---";
  const groupName = groupInfo.groupName || "---";
  const enrolledStudents = groupInfo.students || [];

  let attendanceHistory = $state<GroupAttendanceRecord[]>([]);
  let loading = $state(true);
  let error = $state("");

  const takeAttendanceUrl = `/teacher/courses/${data.academicCourseId}/groups/${groupId}/attendance/take`;

  onMount(async () => {
    if (groupId) {
      await loadHistory();
    } else {
      error = "Error: No se encontró el ID del grupo.";
      loading = false;
    }
  });

  async function loadHistory() {
    loading = true;
    error = "";
    try {
      // Ahora groupId tiene un valor UUID válido
      attendanceHistory = await attendanceService.getGroupAttendanceHistory(groupId);
    } catch (err: any) {
      // Ignoramos 404 (simplemente no hay historial aun)
      if (err.status !== 404) {
        console.error(err);
        error = "No se pudo cargar el historial.";
      }
    } finally {
      loading = false;
    }
  }

  function formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function calculateStudentStats() {
    const studentMap = new SvelteMap<string, any>();

    // Inicializar con todos los inscritos (Base)
    enrolledStudents.forEach((student: any) => {
      const id = student.studentId || student.id; 
      studentMap.set(id, {
        cui: student.cui,
        name: `${student.lastName}, ${student.firstName}`,
        present: 0,
        absent: 0,
        total: 0,
        percentage: 0
      });
    });

    // Sumar historial (Movimientos)
    if (attendanceHistory.length > 0) {
      attendanceHistory.forEach((record) => {
        record.students.forEach((student) => {
          if (studentMap.has(student.studentId)) {
            const stats = studentMap.get(student.studentId)!;
            stats.total++;
            if (student.status === "present") stats.present++;
            else stats.absent++;
          }
        });
      });
    }

    // Calcular porcentajes
    return Array.from(studentMap.values())
      .map((stats) => ({
        ...stats,
        percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function exportToCSV() {
    const stats = calculateStudentStats();
    const headers = ["CUI", "Estudiante", "Presentes", "Ausentes", "Total Clases", "Porcentaje"];
    const rows = stats.map((s) => [s.cui, s.name, s.present, s.absent, s.total, `${s.percentage}%`]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `asistencias_${courseCode}_${groupName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const studentStats = $derived(calculateStudentStats());
</script>

<svelte:head>
  <title>Asistencia - {courseCode}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 space-y-8">
  
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground tracking-tight">Gestión de Asistencia</h1>
      <p class="text-muted-foreground mt-1 text-lg">
        {courseCode} - Grupo {groupName}
      </p>
    </div>
    
    <div class="flex gap-3">
      <Button variant="outline" onclick={exportToCSV} disabled={studentStats.length === 0}>
        <Download class="mr-2 h-4 w-4" /> Exportar
      </Button>
      
      <a href={takeAttendanceUrl}>
        <Button class="bg-primary hover:bg-primary/90 shadow-md">
          <ClipboardList class="mr-2 h-4 w-4" /> 
          Tomar Asistencia
          <ArrowRight class="ml-2 h-4 w-4" />
        </Button>
      </a>
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center py-12">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  {:else if error}
    <div class="rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20 flex gap-3">
      <AlertCircle class="h-5 w-5 shrink-0" />
      <p>{error}</p>
    </div>
  {:else}
    
    <div class="space-y-4">
      <div class="flex items-center gap-2 text-lg font-semibold text-foreground">
        <TrendingUp class="h-5 w-5 text-primary" />
        <h2>Resumen Académico</h2>
      </div>

      <div class="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head class="w-[100px]">CUI</Table.Head>
              <Table.Head>Estudiante</Table.Head>
              <Table.Head class="text-center">Presentes</Table.Head>
              <Table.Head class="text-center">Ausentes</Table.Head>
              <Table.Head class="text-center">Total</Table.Head>
              <Table.Head class="text-center bg-muted/50">% Asist.</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#if studentStats.length > 0}
              {#each studentStats as stat}
                <Table.Row>
                  <Table.Cell class="font-mono font-medium">{stat.cui}</Table.Cell>
                  <Table.Cell>{stat.name}</Table.Cell>
                  <Table.Cell class="text-center text-green-600 font-medium">{stat.present}</Table.Cell>
                  <Table.Cell class="text-center text-red-600 font-medium">{stat.absent}</Table.Cell>
                  <Table.Cell class="text-center">{stat.total}</Table.Cell>
                  <Table.Cell class="text-center bg-muted/30">
                    <span class={stat.percentage < 70 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                      {stat.percentage}%
                    </span>
                  </Table.Cell>
                </Table.Row>
              {/each}
            {:else}
              <Table.Row>
                <Table.Cell colspan={6} class="h-24 text-center text-muted-foreground">
                  No se encontraron estudiantes inscritos en este grupo.
                </Table.Cell>
              </Table.Row>
            {/if}
          </Table.Body>
        </Table.Root>
      </div>
    </div>

    <div class="space-y-4 pt-8">
      <div class="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Calendar class="h-5 w-5 text-primary" />
        <h2>Historial de Clases</h2>
      </div>

      {#if attendanceHistory.length === 0}
        <div class="rounded-xl border border-dashed p-10 text-center">
          <Calendar class="mx-auto h-12 w-12 text-muted-foreground mb-3 opacity-50" />
          <h3 class="text-lg font-medium">Aún no hay asistencias registradas</h3>
          <p class="text-muted-foreground mb-6">Utiliza el botón de arriba para registrar la primera clase.</p>
        </div>
      {:else}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {#each attendanceHistory as record}
            <div class="group rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-all">
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between border-b pb-2">
                  <span class="font-bold text-foreground capitalize flex items-center gap-2">
                     <Calendar class="h-4 w-4 text-primary" />
                     {formatDate(record.classDate)}
                  </span>
                </div>
                
                <div class="flex justify-between text-sm font-medium">
                  <span class="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded">
                    <CheckCircle class="mr-1 h-3 w-3" />
                    {record.students.filter(s => s.status === 'present').length} Presentes
                  </span>
                  <span class="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded">
                    <UserX class="mr-1 h-3 w-3" />
                    {record.students.filter(s => s.status === 'absent').length} Ausentes
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  {/if}
</div>