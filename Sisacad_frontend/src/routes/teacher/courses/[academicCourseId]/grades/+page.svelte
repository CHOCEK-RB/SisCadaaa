<script lang="ts">
  import { groupsService } from "$lib/services/groups.service";
  import type {
    GroupGradesResponse,
    StudentGradeInfo,
  } from "$lib/services/groups.service";
  import { authStore } from "$lib/store/auth.store";
  import { AlertCircle, Save, BarChart3, Download } from "lucide-svelte";
  import TeacherGradesChart from "$lib/components/TeacherGradesChart.svelte";
  import { onMount } from "svelte";
  import { SvelteMap } from "svelte/reactivity";

  let { data } = $props<{ data: any }>();
  const groupId = data.groupId;

  let groupData = $state<GroupGradesResponse | null>(null);
  let loading = $state(true);
  let error = $state("");
  let saving = $state(false);
  let successMessage = $state("");

  let pendingChanges = $state(new Map<string, Partial<any>>());

  const gradeLabels = {
    firstContinue: "C1",
    secondContinue: "C2",
    thirdContinue: "C3",
    firstPartial: "P1",
    secondPartial: "P2",
    thirdPartial: "P3",
  };

  onMount(async () => {
    await loadGroupGrades();
  });

  async function loadGroupGrades() {
    loading = true;
    error = "";
    try {
      const token = authStore.getToken();
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      groupData = await groupsService.getGroupGrades(groupId, token);
    } catch (err: any) {
      error = err.message || "Error al cargar las notas";
    } finally {
      loading = false;
    }
  }

  function handleGradeChange(
    enrollmentId: string,
    gradeKey: string,
    value: string,
  ) {
    const numValue = value === "" ? -1 : parseFloat(value);

    if (numValue !== -1 && (numValue < 0 || numValue > 20)) {
      return;
    }

    if (!pendingChanges.has(enrollmentId)) {
      pendingChanges.set(enrollmentId, {});
    }

    const changes = pendingChanges.get(enrollmentId)!;
    changes[gradeKey] = numValue;
    pendingChanges.set(enrollmentId, changes);
    pendingChanges = new SvelteMap(pendingChanges);
  }

  async function saveChanges() {
    if (pendingChanges.size === 0) {
      return;
    }

    saving = true;
    error = "";
    successMessage = "";

    try {
      const token = authStore.getToken();
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const updates = Array.from(pendingChanges.entries()).map(
        ([enrollmentId, grades]) => ({
          enrollmentId,
          grades,
        }),
      );

      await groupsService.updateMultipleGrades(groupId, updates, token);

      successMessage = `Se guardaron ${updates.length} cambio(s) exitosamente`;
      pendingChanges.clear();
      pendingChanges = new SvelteMap();

      await loadGroupGrades();

      setTimeout(() => {
        successMessage = "";
      }, 3000);
    } catch (err: any) {
      error = err.message || "Error al guardar los cambios";
    } finally {
      saving = false;
    }
  }

  function calculateWeightedAverage(student: StudentGradeInfo): number {
    if (!groupData) return 0;

    const grades = student.grades;
    const scheme = groupData.gradingScheme;

    let total = 0;
    let count = 0;

    Object.entries(gradeLabels).forEach(([key]) => {
      const grade = grades[key as keyof typeof grades];
      const weight = scheme[key as keyof typeof scheme];

      if (grade !== null && grade !== undefined && grade >= 0 && weight) {
        total += (grade * weight) / 100;
        count++;
      }
    });

    return count > 0 ? Math.round(total * 10) / 10 : 0;
  }

  function getGradeColor(grade: number): string {
    if (grade < 0) return "text-gray-400";
    if (grade >= 10.5) return "text-green-600 font-semibold";
    return "text-red-600 font-semibold";
  }

  function exportToCSV() {
    if (!groupData) return;

    const headers = [
      "CUI",
      "Apellidos",
      "Nombres",
      "C1",
      "C2",
      "C3",
      "P1",
      "P2",
      "P3",
      "Promedio",
    ];
    const rows = groupData.students.map((student) => {
      const avg = calculateWeightedAverage(student);
      return [
        student.cui,
        student.lastName,
        student.firstName,
        student.grades.firstContinue >= 0 ? student.grades.firstContinue : "-",
        student.grades.secondContinue >= 0
          ? student.grades.secondContinue
          : "-",
        student.grades.thirdContinue >= 0 ? student.grades.thirdContinue : "-",
        student.grades.firstPartial >= 0 ? student.grades.firstPartial : "-",
        student.grades.secondPartial >= 0 ? student.grades.secondPartial : "-",
        student.grades.thirdPartial >= 0 ? student.grades.thirdPartial : "-",
        avg > 0 ? avg : "-",
      ];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `notas_${groupData.courseCode}_${groupData.groupName}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<svelte:head>
  <title>Notas del Grupo - Sisacad</title>
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
  {:else if groupData}
    <div class="mb-6">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">
            Notas - Grupo {groupData.groupName}
          </h1>
          <p class="text-gray-600">
            {groupData.courseName} ({groupData.courseCode}) - {groupData.groupType}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            onclick={exportToCSV}
            class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            <Download class="h-4 w-4" />
            Exportar CSV
          </button>
          {#if groupData.canEdit && pendingChanges.size > 0}
            <button
              onclick={saveChanges}
              disabled={saving}
              class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {#if saving}
                <div
                  class="h-4 w-4 animate-spin rounded-full border-b-2 border-white"
                ></div>
              {:else}
                <Save class="h-4 w-4" />
              {/if}
              Guardar ({pendingChanges.size})
            </button>
          {/if}
        </div>
      </div>

      {#if !groupData.canEdit}
        <div
          class="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800"
        >
          <AlertCircle class="mr-2 inline h-4 w-4" />
          Las notas solo pueden editarse en grupos de teoría. Este grupo es de tipo:
          {groupData.groupType}
        </div>
      {/if}

      {#if successMessage}
        <div
          class="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {successMessage}
        </div>
      {/if}
    </div>

    <!-- Gráfico -->
    <div class="mb-8">
      <div class="mb-4 flex items-center gap-2">
        <BarChart3 class="h-5 w-5 text-blue-600" />
        <h2 class="text-xl font-semibold text-gray-800">
          Análisis de Rendimiento
        </h2>
      </div>
      <TeacherGradesChart
        students={groupData.students}
        gradingScheme={groupData.gradingScheme}
      />
    </div>

    <!-- Tabla de notas -->
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
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
            {#each Object.values(gradeLabels) as label (label)}
              <th
                class="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                {label}
              </th>
            {/each}
            <th
              class="bg-blue-50 px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Promedio
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          {#each groupData.students as student (student.enrollmentId)}
            {@const average = calculateWeightedAverage(student)}
            <tr class="transition-colors hover:bg-gray-50">
              <td
                class="sticky left-0 z-10 bg-white px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900"
              >
                {student.cui}
              </td>
              <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                {student.lastName}
              </td>
              <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                {student.firstName}
              </td>
              {#each Object.keys(gradeLabels) as key (key)}
                {@const grade =
                  student.grades[key as keyof typeof student.grades]}
                <td class="px-4 py-4 text-center whitespace-nowrap">
                  {#if groupData.canEdit}
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={grade >= 0 ? grade : ""}
                      onchange={(e) =>
                        handleGradeChange(
                          student.enrollmentId,
                          key,
                          e.currentTarget.value,
                        )}
                      class="w-16 rounded border px-2 py-1 text-center text-sm {getGradeColor(
                        grade,
                      )}"
                      placeholder="-"
                    />
                  {:else}
                    <span class="text-sm {getGradeColor(grade)}">
                      {grade >= 0 ? grade.toFixed(1) : "-"}
                    </span>
                  {/if}
                </td>
              {/each}
              <td
                class="bg-blue-50 px-6 py-4 text-center font-bold whitespace-nowrap {average >=
                10.5
                  ? 'text-green-600'
                  : 'text-red-600'}"
              >
                {average > 0 ? average.toFixed(1) : "-"}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h3 class="mb-2 font-semibold text-blue-900">Esquema de Calificación</h3>
      <div
        class="grid grid-cols-2 gap-4 text-sm text-blue-800 md:grid-cols-3 lg:grid-cols-6"
      >
        {#each Object.entries(gradeLabels) as [key, label] (key)}
          <div>
            <span class="font-medium">{label}:</span>
            {groupData.gradingScheme[
              key as keyof typeof groupData.gradingScheme
            ]}%
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
