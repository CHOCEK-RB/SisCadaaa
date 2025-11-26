<script lang="ts">
  import { groupsService } from "$lib/services/groups.service";
  import type {
    GroupGradesResponse,
    StudentGradeInfo,
  } from "$lib/services/groups.service";
  import {
    TriangleAlert,
    Save,
    BarChart,
    Download,
    TrendingUp,
    TrendingDown,
    Baseline,
  } from "lucide-svelte";
  import TeacherGradesChart from "$lib/components/TeacherGradesChart.svelte";
  import TeacherGradesTable from "$lib/components/grades/TeacherGradesTable.svelte";
  import StudentCourseGradesChart from "$lib/components/grades/StudentCourseGradesChart.svelte";
  import { onMount } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import { Button } from "$lib/components/ui/button";

  let { data } = $props<{ data: any }>();
  const groupId = data.groupId;

  let groupData = $state<GroupGradesResponse | null>(null);
  let loading = $state(true);
  let error = $state("");
  let saving = $state(false);
  let successMessage = $state("");

  let pendingChanges = $state(new Map<string, Partial<any>>());
  let selectedStudent: StudentGradeInfo | null = $state(null);

  onMount(async () => {
    loading = false;
    if (data.groupGrades) {
      groupData = data.groupGrades;
    } else if (data.error) {
      error = data.error;
    }
  });

  async function loadGroupGrades() {
    error = "";
    try {
      const refreshedGroupData = await groupsService.getGroupGrades(groupId);
      groupData = refreshedGroupData;
    } catch (err: any) {
      error = err.message || "Error al recargar las notas";
    }
  }

  function handleGradeChange(
    enrollmentId: string,
    gradeKey: string,
    value: number | null,
  ) {
    if (!pendingChanges.has(enrollmentId)) {
      pendingChanges.set(enrollmentId, {});
    }

    const changes = pendingChanges.get(enrollmentId)!;
    changes[gradeKey] = value;
    pendingChanges.set(enrollmentId, changes);
    pendingChanges = new SvelteMap(pendingChanges); // Trigger reactivity
  }

  async function saveChanges() {
    if (pendingChanges.size === 0) {
      return;
    }

    saving = true;
    error = "";
    successMessage = "";

    try {
      const updates = Array.from(pendingChanges.entries()).map(
        ([enrollmentId, grades]) => ({
          enrollmentId,
          grades,
        }),
      );

      await groupsService.updateMultipleGrades(groupId, updates);

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

  function calculateWeightedAverageForStudent(
    student: StudentGradeInfo,
    scheme: GroupGradesResponse["gradingScheme"],
  ): number {
    const grades = student.grades;
    let totalWeight = 0;
    let weightedSum = 0;

    const gradeKeys = [
      "firstContinue",
      "secondContinue",
      "thirdContinue",
      "firstPartial",
      "secondPartial",
      "thirdPartial",
    ];

    gradeKeys.forEach((key) => {
      const grade = grades[key as keyof typeof grades];
      const weight = scheme[key as keyof typeof scheme] || 0;

      if (grade !== null && grade !== undefined && grade >= 0 && weight > 0) {
        weightedSum += grade * weight;
        totalWeight += weight;
      }
    });

    if (totalWeight === 0) return 0;
    const average = weightedSum / totalWeight;
    return Math.round(average * 10) / 10;
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
      const avg = calculateWeightedAverageForStudent(
        student,
        groupData!.gradingScheme,
      );
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

  const allStudentAverages = $derived((): number[] => {
    if (!groupData) return [];
    return groupData.students
      .map((student) =>
        calculateWeightedAverageForStudent(student, groupData!.gradingScheme),
      )
      .filter((avg) => avg > 0);
  });

  const gradeStatistics = $derived(() => {
    const averages = allStudentAverages();
    if (averages.length === 0) {
      return { average: 0, max: 0, min: 0 };
    }

    const sum = averages.reduce((a, b) => a + b, 0);
    const avg = sum / averages.length;
    const max = Math.max(...averages);
    const min = Math.min(...averages);

    return {
      average: parseFloat(avg.toFixed(1)),
      max: parseFloat(max.toFixed(1)),
      min: parseFloat(min.toFixed(1)),
    };
  });
  const gradeLabelsForDisplay = {
    firstContinue: "C1",
    secondContinue: "C2",
    thirdContinue: "C3",
    firstPartial: "P1",
    secondPartial: "P2",
    thirdPartial: "P3",
  };
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
      <TriangleAlert class="mr-3 h-5 w-5 flex-shrink-0" />
      <div><span class="font-medium">Error:</span> {error}</div>
    </div>
  {:else if groupData}
    <div class="mb-6">
      <div class="mb-4 flex flex-col items-start justify-between sm:flex-row">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">
            Notas - Grupo {groupData.groupName}
          </h1>
          <p class="text-gray-600">
            {groupData.courseName} ({groupData.courseCode}) - {groupData.groupType}
          </p>
        </div>
        <div class="mt-4 flex gap-2 sm:mt-0">
          <Button
            variant="outline"
            onclick={exportToCSV}
            class="flex items-center gap-2"
          >
            <Download class="h-4 w-4" />
            Exportar CSV
          </Button>
          {#if groupData.canEdit && pendingChanges.size > 0}
            <Button
              onclick={saveChanges}
              disabled={saving}
              class="flex items-center gap-2"
            >
              {#if saving}
                <div
                  class="h-4 w-4 animate-spin rounded-full border-b-2 border-white"
                ></div>
              {:else}
                <Save class="h-4 w-4" />
              {/if}
              Guardar ({pendingChanges.size})
            </Button>
          {/if}
        </div>
      </div>

      {#if !groupData.canEdit}
        <div
          class="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800"
        >
          <TriangleAlert class="mr-2 inline h-4 w-4" />
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

    <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div
        class="flex items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div
          class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100"
        >
          <Baseline class="h-6 w-6 text-blue-600" />
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500">Promedio General</p>
          <p class="text-2xl font-bold text-gray-900">
            {gradeStatistics().average.toFixed(1)}
          </p>
        </div>
      </div>

      <div
        class="flex items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div
          class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100"
        >
          <TrendingUp class="h-6 w-6 text-green-600" />
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500">Nota Más Alta</p>
          <p class="text-2xl font-bold text-green-600">
            {gradeStatistics().max.toFixed(1)}
          </p>
        </div>
      </div>

      <div
        class="flex items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div
          class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100"
        >
          <TrendingDown class="h-6 w-6 text-red-600" />
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500">Nota Más Baja</p>
          <p class="text-2xl font-bold text-red-600">
            {gradeStatistics().min.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
    <div class="mb-8">
      <div class="mb-4 flex items-center gap-2">
        <BarChart class="h-5 w-5 text-blue-600" />
        <h2 class="text-xl font-semibold text-gray-800">
          Rendimiento General del Grupo
        </h2>
      </div>
      <TeacherGradesChart
        students={groupData.students}
        gradingScheme={groupData.gradingScheme}
      />
    </div>

    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold text-gray-800">
        Calificaciones Detalladas del Grupo
      </h2>
      <TeacherGradesTable
        groupGradesData={groupData}
        onSelectStudent={(student) => (selectedStudent = student)}
        onGradeChange={(payload) =>
          handleGradeChange(
            payload.enrollmentId,
            payload.gradeKey,
            payload.value,
          )}
        canEdit={groupData.canEdit}
        {pendingChanges}
      />
    </div>

    {#if selectedStudent && groupData.gradingScheme}
      <div class="mb-8">
        <h2 class="mb-4 text-xl font-semibold text-gray-800">
          Rendimiento de {selectedStudent.firstName}
          {selectedStudent.lastName}
        </h2>
        <StudentCourseGradesChart
          studentGrades={selectedStudent}
          gradingScheme={groupData.gradingScheme}
        />
      </div>
    {/if}

    <div class="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h3 class="mb-2 font-semibold text-blue-900">Esquema de Calificación</h3>
      <div
        class="grid grid-cols-2 gap-4 text-sm text-blue-800 md:grid-cols-3 lg:grid-cols-6"
      >
        {#each Object.entries(gradeLabelsForDisplay) as [key, label] (key)}
          <div>
            <span class="font-medium">{label}:</span>
            {groupData.gradingScheme[
              key as keyof typeof groupData.gradingScheme
            ] || 0}%
          </div>
        {/each}
      </div>
      <p class="mt-4 text-sm text-blue-800">Nota mínima aprobatoria: 10.5</p>
    </div>
  {:else}
    <div class="rounded-lg border bg-white p-8 text-center shadow-md">
      <BarChart class="mx-auto mb-4 h-16 w-16 text-gray-400" />
      <p class="mb-2 text-lg text-gray-600">
        No hay calificaciones registradas para este grupo.
      </p>
      <p class="text-sm text-gray-500">
        Las calificaciones aparecerán aquí una vez que se registren.
      </p>
    </div>
  {/if}
</div>
