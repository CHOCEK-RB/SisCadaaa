<script lang="ts">
  import type {
    GroupGradesResponse,
    StudentGradeInfo,
  } from "$lib/services/groups.service";
  import * as Card from "$lib/components/ui/card";
  import { onMount } from "svelte";

  let { studentGrades, gradingScheme } = $props<{
    studentGrades: StudentGradeInfo;
    gradingScheme: GroupGradesResponse["gradingScheme"];
  }>();

  let canvasRef: HTMLCanvasElement | null = $state(null);

  interface GradeComponentData {
    name: string;
    grade: number;
    weight: number;
  }

  const chartData = $derived((): GradeComponentData[] => {
    const grades = studentGrades.grades;
    const scheme = gradingScheme;

    const data = [
      {
        name: "C1",
        grade: grades.firstContinue ?? 0,
        weight: scheme.firstContinue ?? 0,
      },
      {
        name: "C2",
        grade: grades.secondContinue ?? 0,
        weight: scheme.secondContinue ?? 0,
      },
      {
        name: "C3",
        grade: grades.thirdContinue ?? 0,
        weight: scheme.thirdContinue ?? 0,
      },
      {
        name: "P1",
        grade: grades.firstPartial ?? 0,
        weight: scheme.firstPartial ?? 0,
      },
      {
        name: "P2",
        grade: grades.secondPartial ?? 0,
        weight: scheme.secondPartial ?? 0,
      },
      {
        name: "P3",
        grade: grades.thirdPartial ?? 0,
        weight: scheme.thirdPartial ?? 0,
      },
    ];

    return data.filter((d) => d.grade !== null && d.grade >= 0); // Only show existing grades
  });

  function getGradeColor(grade: number): string {
    if (grade < 0) return "#9ca3af"; // gray
    if (grade >= 10.5) return "#10b981"; // green
    return "#ef4444"; // red
  }

  onMount(() => {
    drawChart();
  });

  $effect(() => {
    drawChart();
  });

  function drawChart() {
    if (!canvasRef || chartData().length === 0) return;

    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    const width = canvasRef.width;
    const height = canvasRef.height;
    const data = chartData();

    ctx.clearRect(0, 0, width, height);

    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const maxGrade = 20;
    const minGrade = 0;
    const approvalLine = 10.5;

    // Draw background
    ctx.fillStyle = "#f9fafb"; // Tailwind gray-50
    ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);

    // Draw approval line
    const approvalY =
      margin.top +
      chartHeight -
      ((approvalLine - minGrade) / (maxGrade - minGrade)) * chartHeight;
    ctx.strokeStyle = "#ef4444"; // Tailwind red-500
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(margin.left, approvalY);
    ctx.lineTo(margin.left + chartWidth, approvalY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#ef4444"; // Tailwind red-500
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Nota mínima (10.5)", margin.left - 5, approvalY + 4);

    // Draw axes
    ctx.strokeStyle = "#374151"; // Tailwind gray-700
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();

    // Draw Y-axis labels and grid lines
    ctx.fillStyle = "#6b7280"; // Tailwind gray-500
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 20; i += 5) {
      const y =
        margin.top +
        chartHeight -
        ((i - minGrade) / (maxGrade - minGrade)) * chartHeight;
      ctx.fillText(i.toString(), margin.left - 10, y + 4);

      ctx.strokeStyle = "#e5e7eb"; // Tailwind gray-200
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }

    if (data.length === 0) return;

    const barWidth = chartWidth / data.length - 20; // Adjusted for better spacing
    const spacing = 20; // Space between bars

    data.forEach((item, index) => {
      const x = margin.left + index * (barWidth + spacing) + spacing / 2;
      const barHeight =
        ((item.grade - minGrade) / (maxGrade - minGrade)) * chartHeight;
      const y = margin.top + chartHeight - barHeight;

      ctx.fillStyle = getGradeColor(item.grade);
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.strokeStyle = "#374151"; // Tailwind gray-700
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);

      // Grade value text
      ctx.fillStyle = "#1f2937"; // Tailwind gray-800
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.grade.toFixed(1), x + barWidth / 2, y - 8);

      // Component label (C1, P1, etc.)
      ctx.save();
      ctx.translate(x + barWidth / 2, margin.top + chartHeight + 10);
      ctx.fillStyle = "#4b5563"; // Tailwind gray-600
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.name, 0, 0);
      ctx.restore();
    });

    // Chart Title
    ctx.fillStyle = "#1f2937"; // Tailwind gray-800
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Rendimiento por Componente", width / 2, 25);
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Análisis por Componente de Nota</Card.Title>
    <Card.Description>
      Desglose de notas obtenidas en cada evaluación.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    {#if chartData.length > 0}
      <div class="h-[200px] w-full">
        <canvas
          bind:this={canvasRef}
          width="600"
          height="300"
          class="h-full w-full"
        ></canvas>
      </div>
    {:else}
      <div
        class="flex h-[200px] items-center justify-center text-muted-foreground"
      >
        No hay datos de calificaciones para mostrar.
      </div>
    {/if}
  </Card.Content>
</Card.Root>
