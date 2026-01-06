<script lang="ts">
  import type {
    GroupGradesResponse,
    StudentGradeInfo,
  } from "$lib/services/groups.service";
  import * as Card from "$lib/components/ui/card";
  import * as Chart from "$lib/components/ui/chart";
  import { Area, AreaChart, LinearGradient } from "layerchart";
  import { curveNatural } from "d3-shape";
  import { scaleBand, scaleLinear } from "d3-scale";
  import { SvelteMap } from "svelte/reactivity";

  let { groupData } = $props<{ groupData: GroupGradesResponse | null }>();

  const chartData = $derived(() => {
    if (!groupData) return [];
    return groupData.students.map((student: StudentGradeInfo) => ({
      cui: student.cui,
      student: `${student.lastName}, ${student.firstName}`,
      P1: student.grades.firstPartial ?? 0,
      P2: student.grades.secondPartial ?? 0,
      P3: student.grades.thirdPartial ?? 0,
    }));
  });

  const studentNameMap = $derived(() => {
    const map = new SvelteMap<string, string>();
    for (const student of groupData?.students ?? []) {
      map.set(student.cui, `${student.lastName}, ${student.firstName}`);
    }
    return map;
  });

  const series = [
    { key: "P1", label: "Parcial 1", color: "var(--chart-1)" },
    { key: "P2", label: "Parcial 2", color: "var(--chart-2)" },
    { key: "P3", label: "Parcial 3", color: "var(--chart-3)" },
  ];

  const chartConfig = $derived(() => {
    const config: Record<string, any> = {};
    for (const s of series) {
      config[s.key] = { label: s.label, color: s.color };
    }
    return config;
  });
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Rendimiento de Notas Parciales</Card.Title>
    <Card.Description
      >Comparación de las notas parciales entre los estudiantes.</Card.Description
    >
  </Card.Header>
  <Card.Content>
    <Chart.Container config={chartConfig()} class="h-[250px] w-full">
      <AreaChart
        data={chartData()}
        x="cui"
        xScale={scaleBand()}
        yScale={scaleLinear()}
        yDomain={[0, 20]}
        {series}
        props={{
          area: {
            curve: curveNatural,
            "fill-opacity": 0.2,
            line: { class: "stroke-1" },
            motion: "tween",
          },
          line: {
            "stroke-width": 2,
          },
          xAxis: {
            ticks: 4,
          },
        }}
      >
        {#snippet tooltip()}
          <Chart.Tooltip
            labelFormatter={(cui: string) => studentNameMap().get(cui) ?? cui}
          />
        {/snippet}
        {#snippet marks({ getAreaProps, series: chartSeries })}
          {#each chartSeries as s, i (s.key)}
            <LinearGradient
              stops={[
                s.color ?? "",
                "color-mix(in lch, " + s.color + " 10%, transparent)",
              ]}
              vertical
            >
              {#snippet children({ gradient })}
                <Area {...getAreaProps(s, i)} fill={gradient} />
              {/snippet}
            </LinearGradient>
          {/each}
        {/snippet}
      </AreaChart>
    </Chart.Container>
  </Card.Content>
</Card.Root>
