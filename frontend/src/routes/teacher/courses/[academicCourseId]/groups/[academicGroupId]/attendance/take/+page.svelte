<script lang="ts">
  import { attendanceService } from "$lib/services/attendance.service";
  import type { TakeAttendanceResponse } from "$lib/services/attendance.service";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { toast } from "svelte-sonner";
  import { 
    Loader2, Save, UserCheck, UserX, Users, 
    Calendar, Clock, MapPin, AlertCircle, CheckCircle2 
  } from "lucide-svelte";

  let { data } = $props<{ data: any }>();
  
  const groupId = data.groupId;
  const academicCourseId = data.academicCourseId;
  const courseName = data.courseName;
  const groupName = data.groupName;
  const roster = data.roster || [];

  
  let checkData = $state<TakeAttendanceResponse | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state(data.error || "");
  
  
  let isEditingMode = $state(false);

  // Mapa de estados: { "uuid-estudiante": "present" | "absent" }
  let attendanceStatuses = $state<Record<string, "present" | "absent">>({});

  onMount(async () => {
    if (!data.error) {
      await checkSchedule();
    } else {
      loading = false;
    }
  });

  async function checkSchedule() {
    loading = true;
    try {
      // 1. Consultamos al backend si se puede tomar lista hoy
      checkData = await attendanceService.checkCanTakeAttendance(groupId);

      // 2. Determinamos si es CREACIÓN o EDICIÓN
      if (checkData.todayAttendance && checkData.todayAttendance.students.length > 0) {
        // CASO A: Ya existe asistencia -> MODO EDICIÓN
        isEditingMode = true;
        const statuses: Record<string, "present" | "absent"> = {};
        
        // Cargamos los estados guardados
        checkData.todayAttendance.students.forEach((student) => {
          statuses[student.studentId] = student.status;
        });
        attendanceStatuses = statuses;

      } else {
        // CASO B: No hay asistencia hoy -> MODO CREACIÓN
        isEditingMode = false;
        const statuses: Record<string, "present" | "absent"> = {};
        
        // Inicializamos usando el ROSTER del servidor
        roster.forEach((student: any) => {
          // Por defecto todos presentes (ahorra tiempo al profesor)
          // Asegúrate que tu objeto student tenga 'studentId' (viene de GroupGrades)
          statuses[student.studentId] = "present"; 
        });
        attendanceStatuses = statuses;
      }
    } catch (err: any) {
      console.error(err);
      error = err.message || "Error al verificar la sesión de asistencia";
      toast.error(error);
    } finally {
      loading = false;
    }
  }

  function toggleAttendance(studentId: string) {
    attendanceStatuses[studentId] = attendanceStatuses[studentId] === "present" ? "absent" : "present";
  }

  function setAll(status: "present" | "absent") {
    // Actualizamos masivamente el estado local
    Object.keys(attendanceStatuses).forEach(id => {
      attendanceStatuses[id] = status;
    });
  }

  async function saveAttendance() {
    saving = true;
    const toastId = toast.loading("Guardando asistencia...");
    
    try {
      await attendanceService.takeAttendance(
        groupId,
        { studentStatuses: attendanceStatuses }
      );
      
      toast.success("¡Asistencia guardada con éxito!", { id: toastId });
      setTimeout(() => {
        goto(`/teacher/courses/${academicCourseId}/groups/${groupId}/attendance`);
      }, 1000);
      
      isEditingMode = true;
      
    } catch (err: any) {
      toast.error("Error al guardar: " + (err.message || "Intente de nuevo"), { id: toastId });
    } finally {
      saving = false;
    }
  }

  const studentsToList = $derived(
    (isEditingMode && checkData?.todayAttendance?.students.length)
      ? checkData.todayAttendance.students
      : roster.map((s: any) => ({
          studentId: s.studentId,
          cui: s.cui,
          firstName: s.firstName,
          lastName: s.lastName,
          // Usamos el estado actual del mapa
          status: attendanceStatuses[s.studentId] || 'present'
        }))
  );

  const sortedStudents = $derived([...studentsToList].sort((a, b) => a.lastName.localeCompare(b.lastName)));

  // Contadores reactivos
  const presentCount = $derived(Object.values(attendanceStatuses).filter(s => s === "present").length);
  const absentCount = $derived(Object.values(attendanceStatuses).filter(s => s === "absent").length);
  const totalStudents = $derived(Object.keys(attendanceStatuses).length);

</script>

<svelte:head>
  <title>Asistencia - Sisacad</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 space-y-6">
  
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Gestión de Asistencia</h1>
      <p class="text-muted-foreground mt-1 text-lg">
        {courseName} - Grupo {groupName}
      </p>
    </div>
    
    {#if checkData?.canTakeAttendance}
      <Button onclick={saveAttendance} disabled={saving} size="lg" class="w-full md:w-auto shadow-sm min-w-[180px]">
        {#if saving}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Guardando...
        {:else}
          <Save class="mr-2 h-4 w-4" />
          {isEditingMode ? "Modificar Asistencia" : "Tomar Asistencia"}
        {/if}
      </Button>
    {/if}
  </div>

  {#if loading}
    <div class="flex justify-center py-12">
      <Loader2 class="h-10 w-10 animate-spin text-primary" />
    </div>
  {:else if error}
    <div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive flex items-center gap-3">
      <AlertCircle class="h-5 w-5" />
      <span class="font-medium">{error}</span>
    </div>
  {:else if checkData}
    
    {#if !checkData.canTakeAttendance}
      <Card.Root class="border-l-4 border-l-yellow-500 bg-yellow-50/50">
        <Card.Content class="p-6 flex items-start gap-4">
          <Clock class="h-6 w-6 text-yellow-600 mt-1" />
          <div>
            <h3 class="font-semibold text-lg text-yellow-800">No es posible tomar asistencia ahora</h3>
            <p class="text-yellow-700 mt-1">{checkData.reason}</p>
          </div>
        </Card.Content>
      </Card.Root>
    {:else}
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card.Root>
          <Card.Content class="p-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Total Estudiantes</p>
              <p class="text-2xl font-bold">{totalStudents}</p>
            </div>
            <div class="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Users class="h-5 w-5" />
            </div>
          </Card.Content>
        </Card.Root>

        <Card.Root>
          <Card.Content class="p-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Presentes</p>
              <p class="text-2xl font-bold text-green-600">{presentCount}</p>
            </div>
            <div class="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <UserCheck class="h-5 w-5" />
            </div>
          </Card.Content>
        </Card.Root>

        <Card.Root>
          <Card.Content class="p-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Ausentes</p>
              <p class="text-2xl font-bold text-red-600">{absentCount}</p>
            </div>
            <div class="h-10 w-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <UserX class="h-5 w-5" />
            </div>
          </Card.Content>
        </Card.Root>
      </div>

      <div class="flex gap-2">
        <Button variant="outline" size="sm" onclick={() => setAll("present")} 
                class="border-green-200 hover:bg-green-50 text-green-700">
          <UserCheck class="mr-2 h-4 w-4" /> Todos Presentes
        </Button>
        <Button variant="outline" size="sm" onclick={() => setAll("absent")}
                class="border-red-200 hover:bg-red-50 text-red-700">
          <UserX class="mr-2 h-4 w-4" /> Todos Ausentes
        </Button>
      </div>

      <div class="rounded-md border bg-card shadow-sm">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head class="w-[100px]">CUI</Table.Head>
              <Table.Head>Estudiante</Table.Head>
              <Table.Head class="text-center w-[120px]">Estado</Table.Head>
              <Table.Head class="text-right w-[140px]">Acción</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#if sortedStudents.length > 0}
              {#each sortedStudents as student (student.studentId)}
                {@const status = attendanceStatuses[student.studentId]}
                <Table.Row class={status === 'absent' ? 'bg-red-50/40' : ''}>
                  <Table.Cell class="font-mono text-muted-foreground font-medium">
                    {student.cui}
                  </Table.Cell>
                  <Table.Cell>
                    <div class="flex flex-col">
                      <span class="font-medium text-foreground">{student.lastName}, {student.firstName}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell class="text-center">
                    {#if status === 'present'}
                      <Badge class="bg-green-500 hover:bg-green-600">Presente</Badge>
                    {:else}
                      <Badge variant="destructive">Ausente</Badge>
                    {/if}
                  </Table.Cell>
                  <Table.Cell class="text-right">
                    <Button 
                      variant={status === 'present' ? 'default' : 'outline'}
                      size="sm"
                      class={status === 'present' 
                        ? 'bg-green-600 hover:bg-green-700 w-[100px]' 
                        : 'text-red-600 border-red-200 hover:bg-red-50 w-[100px]'}
                      onclick={() => toggleAttendance(student.studentId)}
                    >
                      {#if status === 'present'}
                        <CheckCircle2 class="h-4 w-4 mr-1" /> Asistió
                      {:else}
                        <UserX class="h-4 w-4 mr-1" /> Falto
                      {/if}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              {/each}
            {:else}
              <Table.Row>
                <Table.Cell colspan={4} class="h-24 text-center text-muted-foreground">
                  No se encontraron estudiantes matriculados en este grupo.
                </Table.Cell>
              </Table.Row>
            {/if}
          </Table.Body>
        </Table.Root>
      </div>
    {/if}
  {/if}
</div>