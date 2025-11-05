<script lang="ts">
  import { attendanceService } from "$lib/services/attendance.service";
  import type {
    TakeAttendanceResponse,
    StudentAttendanceInfo,
  } from "$lib/services/attendance.service";
  import { authStore } from "$lib/store/auth.store";
  import {
    AlertCircle,
    CheckCircle,
    Save,
    Clock,
    MapPin,
    Calendar,
    UserCheck,
    UserX,
    Users,
  } from "lucide-svelte";
  import { onMount } from "svelte";

  let { data } = $props<{ data: any }>();
  const groupId = data.groupId;
  const courseName = data.courseName;
  const courseCode = data.courseCode;
  const groupName = data.groupName;

  let checkData = $state<TakeAttendanceResponse | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state("");
  let successMessage = $state("");

  let attendanceStatuses = $state<Record<string, "present" | "absent">>({});

  onMount(async () => {
    await checkSchedule();
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  });

  async function checkSchedule() {
    loading = true;
    error = "";
    try {
      const token = authStore.getToken();
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      checkData = await attendanceService.checkCanTakeAttendance(
        groupId,
        token,
      );

      if (checkData.todayAttendance) {
        const statuses: Record<string, "present" | "absent"> = {};
        checkData.todayAttendance.students.forEach((student) => {
          statuses[student.studentId] = student.status;
        });
        attendanceStatuses = statuses;
      } else if (checkData.canTakeAttendance) {
        const allEnrollments = await loadStudentsList();
        const statuses: Record<string, "present" | "absent"> = {};
        allEnrollments.forEach((student) => {
          statuses[student.studentId] = "absent";
        });
        attendanceStatuses = statuses;
      }
    } catch (err: any) {
      error = err.message || "Error al verificar el horario";
    } finally {
      loading = false;
    }
  }

  async function loadStudentsList(): Promise<StudentAttendanceInfo[]> {
    return [];
  }

  function toggleAttendance(studentId: string) {
    attendanceStatuses[studentId] =
      attendanceStatuses[studentId] === "present" ? "absent" : "present";
    attendanceStatuses = { ...attendanceStatuses };
  }

  function markAllPresent() {
    if (!checkData?.todayAttendance) return;
    const statuses: Record<string, "present" | "absent"> = {};
    checkData.todayAttendance.students.forEach((student) => {
      statuses[student.studentId] = "present";
    });
    attendanceStatuses = statuses;
  }

  function markAllAbsent() {
    if (!checkData?.todayAttendance) return;
    const statuses: Record<string, "present" | "absent"> = {};
    checkData.todayAttendance.students.forEach((student) => {
      statuses[student.studentId] = "absent";
    });
    attendanceStatuses = statuses;
  }

  async function saveAttendance() {
    saving = true;
    error = "";
    successMessage = "";

    try {
      const token = authStore.getToken();
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      await attendanceService.takeAttendance(
        groupId,
        { studentStatuses: attendanceStatuses },
        token,
      );

      successMessage = "¡Asistencia guardada exitosamente!";

      setTimeout(() => {
        successMessage = "";
      }, 3000);
    } catch (err: any) {
      error = err.message || "Error al guardar la asistencia";
    } finally {
      saving = false;
    }
  }

  const presentCount = $derived(
    Object.values(attendanceStatuses).filter((s) => s === "present").length,
  );

  const absentCount = $derived(
    Object.values(attendanceStatuses).filter((s) => s === "absent").length,
  );
</script>

<svelte:head>
  <title>Tomar Asistencia - Sisacad</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div
        class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
      ></div>
    </div>
  {:else if error && !checkData}
    <div
      class="mb-4 flex items-center rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      role="alert"
    >
      <AlertCircle class="mr-3 h-5 w-5 flex-shrink-0" />
      <div><span class="font-medium">Error:</span> {error}</div>
    </div>
  {:else if checkData}
    <div class="mb-6">
      <h1 class="mb-2 text-3xl font-bold text-gray-800">Tomar Asistencia</h1>
      <p class="text-gray-600">
        {courseName} ({courseCode}) - Grupo {groupName}
      </p>
    </div>

    {#if !checkData.canTakeAttendance}
      <div
        class="mb-6 rounded-r-lg border-l-4 border-yellow-400 bg-yellow-50 p-6"
      >
        <div class="flex items-start">
          <AlertCircle
            class="mt-1 mr-3 h-6 w-6 flex-shrink-0 text-yellow-600"
          />
          <div>
            <h3 class="mb-2 text-lg font-semibold text-yellow-800">
              No se puede tomar asistencia en este momento
            </h3>
            <p class="mb-4 text-yellow-700">{checkData.reason}</p>

            {#if checkData.currentSchedule}
              <div class="rounded-lg border border-yellow-200 bg-white p-4">
                <h4 class="mb-3 font-medium text-gray-800">
                  Horario de clase:
                </h4>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center text-gray-700">
                    <Calendar class="mr-2 h-4 w-4 text-gray-500" />
                    <span class="font-medium">Día:</span>
                    <span class="ml-2 capitalize"
                      >{checkData.currentSchedule.day}</span
                    >
                  </div>
                  <div class="flex items-center text-gray-700">
                    <Clock class="mr-2 h-4 w-4 text-gray-500" />
                    <span class="font-medium">Horario:</span>
                    <span class="ml-2"
                      >{checkData.currentSchedule.start} - {checkData
                        .currentSchedule.end}</span
                    >
                  </div>
                  <div class="flex items-center text-gray-700">
                    <MapPin class="mr-2 h-4 w-4 text-gray-500" />
                    <span class="font-medium">Aula:</span>
                    <span class="ml-2"
                      >{checkData.currentSchedule.classroom}</span
                    >
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {:else}
      <div
        class="mb-6 rounded-r-lg border-l-4 border-green-400 bg-green-50 p-4"
      >
        <div class="flex items-center">
          <CheckCircle class="mr-3 h-5 w-5 text-green-600" />
          <div>
            <p class="font-medium text-green-800">
              Puedes tomar asistencia ahora
            </p>
            {#if checkData.currentSchedule}
              <p class="mt-1 text-sm text-green-700">
                Clase: {checkData.currentSchedule.start} - {checkData
                  .currentSchedule.end} | Aula: {checkData.currentSchedule
                  .classroom}
              </p>
            {/if}
          </div>
        </div>
      </div>

      {#if successMessage}
        <div
          class="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <CheckCircle class="mr-2 inline h-4 w-4" />
          {successMessage}
        </div>
      {/if}

      {#if error}
        <div
          class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle class="mr-2 inline h-4 w-4" />
          {error}
        </div>
      {/if}

      {#if checkData.todayAttendance}
        <!-- Resumen -->
        <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            class="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-center"
          >
            <Users class="mx-auto mb-2 h-8 w-8 text-blue-600" />
            <p class="text-2xl font-bold text-blue-900">
              {checkData.todayAttendance.students.length}
            </p>
            <p class="text-sm text-blue-700">Total Estudiantes</p>
          </div>
          <div
            class="rounded-lg border-2 border-green-200 bg-green-50 p-4 text-center"
          >
            <UserCheck class="mx-auto mb-2 h-8 w-8 text-green-600" />
            <p class="text-2xl font-bold text-green-900">{presentCount}</p>
            <p class="text-sm text-green-700">Presentes</p>
          </div>
          <div
            class="rounded-lg border-2 border-red-200 bg-red-50 p-4 text-center"
          >
            <UserX class="mx-auto mb-2 h-8 w-8 text-red-600" />
            <p class="text-2xl font-bold text-red-900">{absentCount}</p>
            <p class="text-sm text-red-700">Ausentes</p>
          </div>
        </div>

        <!-- Botones de marcado rápido -->
        <div class="mb-6 flex gap-3">
          <button
            onclick={markAllPresent}
            class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            <UserCheck class="h-4 w-4" />
            Marcar Todos Presentes
          </button>
          <button
            onclick={markAllAbsent}
            class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            <UserX class="h-4 w-4" />
            Marcar Todos Ausentes
          </button>
          <button
            onclick={saveAttendance}
            disabled={saving}
            class="ml-auto flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {#if saving}
              <div
                class="h-4 w-4 animate-spin rounded-full border-b-2 border-white"
              ></div>
            {:else}
              <Save class="h-4 w-4" />
            {/if}
            Guardar Asistencia
          </button>
        </div>

        <!-- Tabla de asistencia -->
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
                  Apellidos
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Nombres
                </th>
                <th
                  class="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Asistencia
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              {#each checkData.todayAttendance.students as student (student.studentId)}
                {@const status = attendanceStatuses[student.studentId]}
                <tr class="transition-colors hover:bg-gray-50">
                  <td
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900"
                  >
                    {student.cui}
                  </td>
                  <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {student.lastName}
                  </td>
                  <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {student.firstName}
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap">
                    <button
                      onclick={() => toggleAttendance(student.studentId)}
                      class="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors {status ===
                      'present'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'}"
                    >
                      {#if status === "present"}
                        <CheckCircle class="h-4 w-4" />
                        Presente
                      {:else}
                        <UserX class="h-4 w-4" />
                        Ausente
                      {/if}
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {/if}
  {/if}
</div>
