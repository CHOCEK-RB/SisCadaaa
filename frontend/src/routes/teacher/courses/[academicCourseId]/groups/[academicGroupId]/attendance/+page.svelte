<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import AttendanceTable from "$lib/components/tables/teacher/attendance/AttendanceTable.svelte";
  import * as Dialog from "$lib/components/ui/dialog"; // Import all Dialog components
  import AttendanceDetailTable from "$lib/components/tables/teacher/attendance/AttendanceDetailTable.svelte"; // Import new detail table

  import {
    AlertCircle,
    Calendar,
    Download,
    ClipboardList,
    ArrowRight,
    CheckCircle,
    UserX,
  } from "lucide-svelte";

  import type { GroupAttendanceRecord } from "$lib/services/attendance.service";

  let { data } = $props<{ data: any }>();

  const groupId = data.academicGroupId;

  const groupInfo = data.groupGrades || {};
  const courseCode = groupInfo.courseCode || "---";
  const groupName = groupInfo.groupName || "---";

  const attendanceHistory: GroupAttendanceRecord[] =
    data.attendanceHistory || [];
  const studentStats = data.studentStats || [];
  const serverError = data.error;

  const takeAttendanceUrl = `/teacher/courses/${data.academicCourseId}/groups/${groupId}/attendance/take`;

  let showDialog = $state(false);
  let selectedRecord: GroupAttendanceRecord | null = $state(null);

  function openDetailDialog(record: GroupAttendanceRecord) {
    selectedRecord = record;
    showDialog = true;
  }

  function formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function exportToCSV() {
    const stats = studentStats;
    const headers = [
      "CUI",
      "Estudiante",
      "Presentes",
      "Ausentes",
      "Total Clases",
      "Porcentaje",
    ];
    const rows = stats.map((s: any) => [
      s.cui,
      s.name,
      s.present,
      s.absent,
      s.total,
      `${s.percentage}%`,
    ]);
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
</script>

<svelte:head>
  <title>Asistencia - {courseCode}</title>
</svelte:head>

<Dialog.Root bind:open={showDialog}>
  <div class="container mx-auto space-y-8 px-4 py-8">
    <div
      class="flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          Gestión de Asistencia
        </h1>
        <p class="mt-1 text-lg text-muted-foreground">
          {courseCode} - Grupo {groupName}
        </p>
      </div>

      <div class="flex gap-3">
        <Button
          variant="outline"
          onclick={exportToCSV}
          disabled={studentStats.length === 0}
        >
          <Download class="mr-2 h-4 w-4" /> Exportar
        </Button>

        <a href={takeAttendanceUrl}>
          <Button class="bg-primary shadow-md hover:bg-primary/90">
            <ClipboardList class="mr-2 h-4 w-4" />
            Tomar Asistencia
            <ArrowRight class="ml-2 h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>

    {#if serverError}
      <div
        class="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive"
      >
        <AlertCircle class="h-5 w-5 shrink-0" />
        <p>{serverError}</p>
      </div>
    {:else}
      <AttendanceTable {studentStats} />

      <div class="space-y-4 pt-8">
        <div
          class="flex items-center gap-2 text-lg font-semibold text-foreground"
        >
          <Calendar class="h-5 w-5 text-primary" />
          <h2>Historial de Clases</h2>
        </div>

        {#if attendanceHistory.length === 0}
          <div class="rounded-xl border border-dashed p-10 text-center">
            <Calendar
              class="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50"
            />
            <h3 class="text-lg font-medium">
              Aún no hay asistencias registradas
            </h3>
            <p class="mb-6 text-muted-foreground">
              Utiliza el botón de arriba para registrar la primera clase.
            </p>
          </div>
        {:else}
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each attendanceHistory as record (record.attendanceId)}
              <Dialog.Trigger>
                <button
                  type="button"
                  class="group w-full cursor-pointer rounded-lg border bg-card p-4 shadow-sm transition-all hover:bg-secondary"
                  onclick={() => openDetailDialog(record)}
                >
                  <div class="flex flex-col gap-3">
                    <div
                      class="flex items-center justify-between border-b pb-2"
                    >
                      <span
                        class="flex items-center gap-2 font-bold text-foreground capitalize"
                      >
                        <Calendar class="h-4 w-4 text-primary" />
                        {formatDate(record.classDate)}
                      </span>
                    </div>

                    <div class="flex justify-between text-sm font-medium">
                      <span
                        class="flex items-center rounded bg-green-50 px-2 py-1 text-green-600"
                      >
                        <CheckCircle class="mr-1 h-3 w-3" />
                        {record.students.filter((s) => s.status === "present")
                          .length} Presentes
                      </span>
                      <span
                        class="flex items-center rounded bg-red-50 px-2 py-1 text-red-600"
                      >
                        <UserX class="mr-1 h-3 w-3" />
                        {record.students.filter((s) => s.status === "absent")
                          .length} Ausentes
                      </span>
                    </div>
                  </div>
                </button>
              </Dialog.Trigger>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#if selectedRecord}
    <Dialog.Content class="sm:max-w-[800px]">
      <Dialog.Header>
        <Dialog.Title
          >Asistencia del día: {formatDate(
            selectedRecord.classDate,
          )}</Dialog.Title
        >
        <Dialog.Description>
          Detalle de la asistencia para esta clase.
        </Dialog.Description>
      </Dialog.Header>
      <div class="grid gap-4 py-4">
        <AttendanceDetailTable record={selectedRecord} />
      </div>
      <Dialog.Footer>
        <Button variant="outline" onclick={() => (showDialog = false)}
          >Cerrar</Button
        >
      </Dialog.Footer>
    </Dialog.Content>
  {/if}
</Dialog.Root>
