<script lang="ts">
  import type { GradesAndPercent } from '$lib/services/enrollment.service';
  import { onMount } from 'svelte';

  export interface CourseInfo {
    courseName: string;
    courseCode: string;
    average: number;
  }

  let { gradesData = [] } = $props<{
    gradesData: GradesAndPercent[];
  }>();

  let canvasRef: HTMLCanvasElement;

  const gradeLabels: { [key: string]: string } = {
    firstContinue: 'C1',
    secondContinue: 'C2',
    thirdContinue: 'C3',
    firstPartial: 'P1',
    secondPartial: 'P2',
    thirdPartial: 'P3',
  };

  function calculateWeightedAverage(grades: any, percent: any): number {
    let total = 0;
    let count = 0;

    Object.entries(gradeLabels).forEach(([key]) => {
      const grade = grades[key];
      const weight = percent[key];

      if (grade !== null && grade !== undefined && weight) {
        total += (grade * weight) / 100;
        count++;
      }
    });

    return count > 0 ? Math.round(total * 10) / 10 : 0;
  }

  const chartData = $derived(() => {
    return gradesData
      .map((item: GradesAndPercent) => ({
        courseName: item.course.course?.name || 'Sin nombre',
        courseCode: item.course.course?.code || 'N/A',
        average: calculateWeightedAverage(item.grades, item.percent),
      }))
      .filter((item: CourseInfo) => item.average > 0);
  });

  onMount(() => {
    drawChart();
  });

  function drawChart() {
    if (!canvasRef || chartData().length === 0) return;

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const width = canvasRef.width;
    const height = canvasRef.height;
    const data = chartData();

    ctx.clearRect(0, 0, width, height);

    const margin = { top: 40, right: 30, bottom: 80, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const maxGrade = 20;
    const minGrade = 0;
    const approvalLine = 10.5;

    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);

    const approvalY =
      margin.top +
      chartHeight -
      ((approvalLine - minGrade) / (maxGrade - minGrade)) * chartHeight;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(margin.left, approvalY);
    ctx.lineTo(margin.left + chartWidth, approvalY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Nota mínima (10.5)', margin.left - 5, approvalY + 4);

    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);

    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();

    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 20; i += 5) {
      const y =
        margin.top +
        chartHeight -
        ((i - minGrade) / (maxGrade - minGrade)) * chartHeight;
      ctx.fillText(i.toString(), margin.left - 10, y + 4);

      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }

    if (data.length === 0) return;

    const stepX = chartWidth / (data.length + 1);
    const points: { x: number; y: number; value: number }[] = [];

    data.forEach((item: CourseInfo, index: number) => {
      const x = margin.left + stepX * (index + 1);
      const y =
        margin.top +
        chartHeight -
        ((item.average - minGrade) / (maxGrade - minGrade)) * chartHeight;
      points.push({ x, y, value: item.average });
    });

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    points.forEach((point, index) => {
      ctx.fillStyle = point.value >= approvalLine ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(point.value.toFixed(1), point.x, point.y - 15);

      ctx.save();
      ctx.translate(point.x, margin.top + chartHeight + 10);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#4b5563';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      const label =
        data[index].courseCode.length > 10
          ? data[index].courseCode.substring(0, 10) + '...'
          : data[index].courseCode;
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Rendimiento Académico por Curso', width / 2, 25);

    const legendY = height - 15;

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(width / 2 - 100, legendY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Aprobado', width / 2 - 90, legendY + 4);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(width / 2 + 20, legendY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#374151';
    ctx.fillText('Reprobado', width / 2 + 30, legendY + 4);
  }

  $effect(() => {
    if (chartData().length > 0) {
      drawChart();
    }
  });
</script>

<div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
  <canvas
    bind:this={canvasRef}
    width="1000"
    height="500"
    class="w-full h-auto"
    style="max-height: 500px;"
  ></canvas>

  {#if chartData().length === 0}
    <div class="text-center py-8">
      <p class="text-gray-500">
        No hay datos suficientes para mostrar el gráfico
      </p>
    </div>
  {/if}
</div>
