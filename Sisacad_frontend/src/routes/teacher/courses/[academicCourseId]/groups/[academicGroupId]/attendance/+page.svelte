<script lang="ts">
  import { attendanceService } from "$lib/services/attendance.service";
  import type { GroupAttendanceRecord } from "$lib/services/attendance.service";
  import { authStore } from "$lib/store/auth.store";
  import {
    AlertCircle,
    CheckCircle,
    UserX,
    Calendar,
    Download,
    TrendingUp,
  } from "lucide-svelte";
  import { onMount } from "svelte";
  import { SvelteMap } from "svelte/reactivity";

  let { data } = $props<{ data: any }>();
  const groupId = data.groupId;

  console.log(groupId);
  const courseCode = data.courseCode;
  const groupName = data.groupName;

  let attendanceHistory = $state<GroupAttendanceRecord[]>([]);
  let loading = $state(true);
  let error = $state("");

  onMount(async () => {
    await loadHistory();
  });

  async function loadHistory() {
    loading = true;
    error = "";
    try {
      const token = authStore.getToken();
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      attendanceHistory = await attendanceService.getGroupAttendanceHistory(
        groupId,
        token,
      );
    } catch (err: any) {
      error = err.message || "Error al cargar el historial";
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
    if (attendanceHistory.length === 0) return [];

    const studentMap = new SvelteMap<
      string,
      {
        cui: string;
        name: string;
        present: number;
        absent: number;
        total: number;
      }
    >();

    attendanceHistory.forEach((record) => {
      record.students.forEach((student) => {
        if (!studentMap.has(student.studentId)) {
          studentMap.set(student.studentId, {
            cui: student.cui,
            name: `${student.lastName}, ${student.firstName}`,
            present: 0,
            absent: 0,
            total: 0,
          });
        }

        const stats = studentMap.get(student.studentId)!;
        stats.total++;
        if (student.status === "present") {
          stats.present++;
        } else {
          stats.absent++;
        }
      });
    });

    return Array.from(studentMap.values())
      .map((stats) => ({
        ...stats,
        percentage: Math.round((stats.present / stats.total) * 100),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function exportToCSV() {
    const stats = calculateStudentStats();
    const headers = [
      "CUI",
      "Estudiante",
      "Presentes",
      "Ausentes",
      "Total Clases",
      "Porcentaje",
    ];
    const rows = stats.map((s) => [
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
    link.setAttribute(
      "download",
      `asistencias_${courseCode}_${groupName}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const studentStats = $derived(calculateStudentStats());
</script>

<svelte:head>
  <title>Historial de Asistencias - Sisacad</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div
        class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
      ></div>
    </div>
  {:else if error}
    <div
      class="mb-4 flex items-center rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      role="alert"
    >
      <AlertCircle class="mr-3 h-5 w-5 flex-shrink-0" />
      <div><span class="font-medium">Error:</span> {error}</div>
    </div>
  {:else}
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="mb-2 text-3xl font-bold text-gray-800">
            Historial de Asistencias
          </h1>
        </div>
        <button
          onclick={exportToCSV}
          class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
        >
          <Download class="h-4 w-4" />
          Exportar CSV
        </button>
      </div>
    </div>

    {#if attendanceHistory.length === 0}
      <div class="rounded-lg border bg-white p-8 text-center shadow-md">
        <Calendar class="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <p class="mb-2 text-lg text-gray-600">
          No hay registros de asistencia aún
        </p>
        <p class="text-sm text-gray-500">
          Las asistencias aparecerán aquí una vez que se registren
        </p>
      </div>
    {:else}
      <!-- Resumen General -->
      <div class="mb-8">
        <div class="mb-4 flex items-center gap-2">
          <TrendingUp class="h-5 w-5 text-blue-600" />
          <h2 class="text-xl font-semibold text-gray-800">
            Resumen por Estudiante
          </h2>
        </div>
        <div
          class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  CUI
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Estudiante
                </th>
                <th
                  class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Presentes
                </th>
                <th
                  class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Ausentes
                </th>
                <th
                  class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Total
                </th>
                <th
                  class="bg-blue-50 px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Asistencia
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              {#each studentStats as stats (stats.cui)}
                <tr class="transition-colors hover:bg-gray-50">
                  <td
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900"
                  >
                    {stats.cui}
                  </td>
                  <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {stats.name}
                  </td>
                  <td
                    class="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap text-green-600"
                  >
                    {stats.present}
                  </td>
                  <td
                    class="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap text-red-600"
                  >
                    {stats.absent}
                  </td>
                  <td
                    class="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap text-gray-900"
                  >
                    {stats.total}
                  </td>
                  <td
                    class="bg-blue-50 px-6 py-4 text-center whitespace-nowrap"
                  >
                    <div class="flex items-center justify-center gap-2">
                      <span
                        class="text-lg font-bold {stats.percentage >= 70
                          ? 'text-green-600'
                          : stats.percentage >= 50
                            ? 'text-yellow-600'
                            : 'text-red-600'}"
                      >
                        {stats.percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Historial por Fecha -->
      <div>
        <div class="mb-4 flex items-center gap-2">
          <Calendar class="h-5 w-5 text-blue-600" />
          <h2 class="text-xl font-semibold text-gray-800">
            Historial por Fecha
          </h2>
        </div>
        <div class="space-y-4">
          {#each attendanceHistory as record (record.attendanceId)}
            {@const presentCount = record.students.filter(
              (s) => s.status === "present",
            ).length}
            {@const absentCount = record.students.filter(
              (s) => s.status === "absent",
            ).length}
            <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-gray-800">
                    {formatDate(record.classDate)}
                  </h3>
                  <div class="flex gap-4 text-sm">
                    <span class="font-medium text-green-600">
                      <CheckCircle class="mr-1 inline h-4 w-4" />
                      {presentCount} presentes
                    </span>
                    <span class="font-medium text-red-600">
                      <UserX class="mr-1 inline h-4 w-4" />
                      {absentCount} ausentes
                    </span>
                  </div>
                </div>
              </div>
              <div class="p-6">
                <div
                  class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
                >
                  {#each record.students as student (student.studentId)}
                    <div
                      class="flex items-center gap-3 rounded-lg p-3 {student.status ===
                      'present'
                        ? 'border border-green-200 bg-green-50'
                        : 'border border-red-200 bg-red-50'}"
                    >
                      {#if student.status === "present"}
                        <CheckCircle
                          class="h-5 w-5 flex-shrink-0 text-green-600"
                        />
                      {:else}
                        <UserX class="h-5 w-5 flex-shrink-0 text-red-600" />
                      {/if}
                      <div class="min-w-0 flex-1">
                        <p
                          class="truncate text-sm font-medium text-gray-900"
                          title={`${student.lastName}, ${student.firstName}`}
                        >
                          {student.lastName}, {student.firstName}
                        </p>
                        <p class="text-xs text-gray-500">{student.cui}</p>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>
