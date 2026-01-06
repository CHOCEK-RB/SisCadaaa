<script lang="ts">
  import type { GradesAndPercent } from "$lib/services/enrollment.service";
  import * as Card from "$lib/components/ui/card";
  import * as Chart from "$lib/components/ui/chart";
  import { scaleBand, scaleLinear } from "d3-scale";
  import { Area, AreaChart, LinearGradient } from "layerchart";
  import { curveNatural } from "d3-shape";

  let { gradesData = [] } = $props<{
    gradesData: GradesAndPercent[];
  }>();

  const chartData = $derived(() => {
    return gradesData
      .map((item: GradesAndPercent) => {
        if (!item.grades || !item.percent) {
          return null;
        }

        const g = item.grades;
        const p = item.percent;
        const finalGrade =
          ((g.firstContinue ?? 0) * (p.firstContinue ?? 0)) / 100 +
          ((g.secondContinue ?? 0) * (p.secondContinue ?? 0)) / 100 +
          ((g.thirdContinue ?? 0) * (p.thirdContinue ?? 0)) / 100 +
          ((g.firstPartial ?? 0) * (p.firstPartial ?? 0)) / 100 +
          ((g.secondPartial ?? 0) * (p.secondPartial ?? 0)) / 100 +
          ((g.thirdPartial ?? 0) * (p.thirdPartial ?? 0)) / 100;

        const hasSomeGrade = Object.values(g).some((grade) => grade !== null);
        if (hasSomeGrade) {
          return {
            grade: finalGrade,
            courseName: item.course.course?.name || "N/A",
            courseCode: item.course.course?.code || "N/A",
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort(
        (
          a: { grade: number; courseCode: string; courseName: string },
          b: { grade: number; courseCode: string; courseName: string },
        ) => (a!.courseCode > b!.courseCode ? 1 : -1),
      ) as {
      grade: number;
      courseName: string;
      courseCode: string;
    }[];
  });

  const chartConfig = {
    grade: {
      label: "Nota Final",
      color: "var(--primary)",
    },
  } satisfies Chart.ChartConfig;
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Comparativa de Notas por Curso</Card.Title>
    <Card.Description>Nota final obtenida en cada curso.</Card.Description>
  </Card.Header>
  <Card.Content>
    <Chart.Container config={chartConfig} class="h-[200px] w-full">
      <AreaChart
        data={chartData()}
        x="courseCode"
        y="grade"
        xScale={scaleBand()}
        yScale={scaleLinear()}
        series={[
          {
            key: "grade",
            label: "Nota Final",
            color: "var(--primary)",
          },
        ]}
        labels
        props={{
          area: {
            curve: curveNatural,
            "fill-opacity": 0.4,
            line: { class: "stroke-1" },
            motion: "tween",
          },
          xAxis: {
            ticks: 5,
          },
        }}
      >
        {#snippet tooltip()}
          <Chart.Tooltip
            labelFormatter={(code: string) => {
              const course = chartData().find((c) => c.courseCode === code);
              return course?.courseName || code;
            }}
            indicator="line"
          />
        {/snippet}
        {#snippet marks({ getAreaProps, series })}
          {#each series as s, i (s.key)}
            <LinearGradient
              stops={[
                "var(--primary)",
                "color-mix(in lch, " + "var(--primary)" + " 10%, transparent)",
              ]}
              vertical
            >
              {#snippet children({ gradient })}
                <Area
                  {...getAreaProps(s, i)}
                  line={{ class: "stroke-primary" }}
                  fill={gradient}
                />
              {/snippet}
            </LinearGradient>
          {/each}
        {/snippet}
      </AreaChart>
    </Chart.Container>
  </Card.Content>
</Card.Root>
