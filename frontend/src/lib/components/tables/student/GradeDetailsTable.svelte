<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import { cn } from "$lib/utils";

  export type GradeDetail = {
    label: string;
    score: string | number;
    weight: number;
  };

  let { gradeDetails }: { gradeDetails: () => GradeDetail[] } = $props();
</script>

<div>
  <h3 class="mb-4 text-lg font-semibold">Detalle de Notas</h3>
  <div class="rounded-md border">
    <Table.Root class="text-xl">
      <Table.Header>
        <Table.Row>
          <Table.Head>Evaluación</Table.Head>
          <Table.Head class="text-center">Peso (%)</Table.Head>
          <Table.Head class="text-center">Nota</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each gradeDetails() as item (item)}
          <Table.Row>
            <Table.Cell class="font-medium">{item.label}</Table.Cell>
            <Table.Cell class="text-center">{item.weight}%</Table.Cell>
            <Table.Cell
              class={cn(
                "text-center font-bold",
                item.score === "-" && "text-muted-foreground",
              )}
            >
              {item.score}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
