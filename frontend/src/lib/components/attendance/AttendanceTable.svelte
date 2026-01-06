<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { CircleCheck, CircleX } from "lucide-svelte";
  import type { StudentAttendanceRecordDTO } from "$lib/types/attendance.types";

  type Props = {
    records: StudentAttendanceRecordDTO[];
  };
  let { records }: Props = $props();

  function capitalize(str: string | undefined | null): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  function formatDate(isoString: string | undefined | null): string {
    if (!isoString) return "Fecha inválida";
    try {
      return new Date(isoString).toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
    } catch (error) {
      return `Fecha inválida ${error}`;
    }
  }
</script>

<div class="rounded-md border">
  <Table.Root class="text-lg">
    <Table.Header>
      <Table.Row>
        <Table.Head>Fecha de Clase</Table.Head>
        <Table.Head class="text-center">Estado</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#if records.length > 0}
        {#each records as record (record.classDate)}
          <Table.Row>
            <Table.Cell class="pt-4 pb-4 font-medium">
              {formatDate(record.classDate)}
            </Table.Cell>
            <Table.Cell class="text-center">
              <Badge
                variant={record.status === "present"
                  ? "default"
                  : "destructive"}
                class="h-10 w-[140px] items-center justify-center text-lg"
              >
                {#if record.status === "present"}
                  <CircleCheck class="mr-2 h-10 w-10" />
                {:else if record.status === "absent"}
                  <CircleX class="mr-2 h-10 w-10" />
                {/if}
                {capitalize(record.status)}
              </Badge>
            </Table.Cell>
          </Table.Row>
        {/each}
      {:else}
        <Table.Row>
          <Table.Cell
            colspan={2}
            class="h-24 text-center text-muted-foreground"
          >
            No hay registros detallados de asistencia.
          </Table.Cell>
        </Table.Row>
      {/if}
    </Table.Body>
  </Table.Root>
</div>
