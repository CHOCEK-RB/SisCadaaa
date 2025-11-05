<script lang="ts">
  import type { StudentGradeInfo } from "$lib/services/groups.service";
  import { onMount } from "svelte";

  let { students = [], gradingScheme } = $props<{
    students: StudentGradeInfo[];
    gradingScheme: any;
  }>();

  let canvasRef: HTMLCanvasElement;

  interface StudentAverage {
    name: string;
    average: number;
  }

  function calculateWeightedAverage(grades: any, scheme: any): number {
    const validGrades: number[] = [];
    const weights: number[] = [];

    const gradeKeys = [
      "firstContinue",
      "secondContinue",
      "thirdContinue",
      "firstPartial",
      "secondPartial",
      "thirdPartial",
    ];

    for (const key of gradeKeys) {
      const grade = grades[key];
      const weight = scheme[key];

      if (grade !== null && grade !== undefined && grade >= 0 && weight) {
        validGrades.push(grade);
        weights.push(weight);
      }
    }

    if (validGrades.length === 0) return 0;

    let total = 0;
    for (let i = 0; i < validGrades.length; i++) {
      total += (validGrades[i] * weights[i]) / 100;
    }

    return Math.round(total * 10) / 10;
  }

  const chartData = $derived((): StudentAverage[] => {
    return students
      .map((student: StudentGradeInfo) => ({
        name: `${student.cui}`,
        average: calculateWeightedAverage(student.grades, gradingScheme),
      }))
      .filter((item: { name: string; average: number }) => item.average > 0)
      .sort(
        (
          a: { name: string; average: number },
          b: { name: string; average: number },
        ) => b.average - a.average,
      )
      .slice(0, 40);
  });

  onMount(() => {
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

    const margin = { top: 40, right: 30, bottom: 120, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const maxGrade = 20;
    const minGrade = 0;
    const approvalLine = 10.5;

    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);

    const approvalY =
      margin.top +
      chartHeight -
      ((approvalLine - minGrade) / (maxGrade - minGrade)) * chartHeight;
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(margin.left, approvalY);
    ctx.lineTo(margin.left + chartWidth, approvalY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#ef4444";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Nota mínima (10.5)", margin.left - 5, approvalY + 4);

    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();

    ctx.fillStyle = "#6b7280";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 20; i += 5) {
      const y =
        margin.top +
        chartHeight -
        ((i - minGrade) / (maxGrade - minGrade)) * chartHeight;
      ctx.fillText(i.toString(), margin.left - 10, y + 4);

      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }

    if (data.length === 0) return;

    const barWidth = chartWidth / data.length - 10;
    const spacing = 10;

    data.forEach((item, index) => {
      const x = margin.left + index * (barWidth + spacing) + spacing / 2;
      const barHeight =
        ((item.average - minGrade) / (maxGrade - minGrade)) * chartHeight;
      const y = margin.top + chartHeight - barHeight;

      ctx.fillStyle = item.average >= approvalLine ? "#10b981" : "#ef4444";
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);

      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.average.toFixed(1), x + barWidth / 2, y - 8);

      ctx.save();
      ctx.translate(x + barWidth / 2, margin.top + chartHeight + 10);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = "#4b5563";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      const label =
        item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name;
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });

    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Rendimiento Academico", width / 2, 25);

    const legendY = height - 15;

    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(width / 2 - 100, legendY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Aprobado", width / 2 - 90, legendY + 4);

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(width / 2 + 20, legendY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.fillText("Reprobado", width / 2 + 30, legendY + 4);
  }

  $effect(() => {
    if (chartData().length > 0) {
      drawChart();
    }
  });
</script>

<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  <canvas
    bind:this={canvasRef}
    width="1000"
    height="500"
    class="h-auto w-full"
    style="max-height: 500px;"
  ></canvas>

  {#if chartData().length === 0}
    <div class="py-8 text-center">
      <p class="text-gray-500">
        No hay datos suficientes para mostrar el gráfico
      </p>
    </div>
  {/if}
</div>
