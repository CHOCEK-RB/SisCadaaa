<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as Chart from "$lib/components/ui/chart";
  import { Area, AreaChart } from "layerchart";
  import { curveNatural } from "d3-shape";
  import { scaleBand, scaleLinear } from "d3-scale";

  const multiSeriesData = [
    { month: "Jan", apples: 10, bananas: 20, oranges: 5 },
    { month: "Feb", apples: 12, bananas: 22, oranges: 7 },
    { month: "Mar", apples: 15, bananas: 25, oranges: 10 },
    { month: "Apr", apples: 13, bananas: 23, oranges: 8 },
    { month: "May", apples: 16, bananas: 26, oranges: 11 },
    { month: "Jun", apples: 18, bananas: 28, oranges: 12 },
  ];

  const series = [
    { key: "apples", label: "Apples", color: "red" },
    { key: "bananas", label: "Bananas", color: "blue" },
    { key: "oranges", label: "Oranges", color: "orange" },
  ];

  const chartConfig = {
    apples: { label: "Apples", color: "red" },
    bananas: { label: "Bananas", color: "blue" },
    oranges: { label: "Oranges", color: "orange" },
  };
</script>

<svelte:head>
  <title>Chart Test</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="mb-4 text-2xl font-bold">Multi-series Chart Test</h1>

  <Card.Root>
    <Card.Header>
      <Card.Title>Fruit Sales</Card.Title>
      <Card.Description>Monthly sales of different fruits.</Card.Description>
    </Card.Header>
    <Card.Content>
      <Chart.Container config={chartConfig} class="h-[300px] w-full">
        <AreaChart
          data={multiSeriesData}
          x="month"
          xScale={scaleBand()}
          yScale={scaleLinear()}
          yDomain={[0, 30]}
          {series}
        >
          {#snippet marks({ getAreaProps, series: chartSeries })}
            {#each chartSeries as s, i (s.key)}
              <Area
                {...getAreaProps(s, i)}
                fill={s.color}
                fill-opacity={0.2}
                line={{ style: `stroke: ${s.color}; stroke-width: 2px;` }}
              />
            {/each}
          {/snippet}
        </AreaChart>
      </Chart.Container>
    </Card.Content>
  </Card.Root>
</div>
