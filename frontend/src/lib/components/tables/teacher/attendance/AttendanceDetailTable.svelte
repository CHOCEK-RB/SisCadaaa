<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import type { GroupAttendanceRecord } from "$lib/services/attendance.service";
  import { CheckCircle, UserX } from "lucide-svelte";
  import { ScrollArea } from "$lib/components/ui/scroll-area"; // Import ScrollArea

  let { record } = $props<{ record: GroupAttendanceRecord }>();
</script>

<ScrollArea class="h-[300px] w-full rounded-md border">
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head>CUI</Table.Head>
        <Table.Head>Estudiante</Table.Head>
        <Table.Head class="text-center">Estado</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each record.students as student (student.studentId)}
        <Table.Row>
          <Table.Cell class="font-mono font-medium">{student.cui}</Table.Cell>
          <Table.Cell>{student.lastName}, {student.firstName}</Table.Cell>
          <Table.Cell class="text-center">
            {#if student.status === "present"}
              <span
                class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
              >
                <CheckCircle class="h-3 w-3" />
                Presente
              </span>
            {:else}
              <span
                class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
              >
                <UserX class="h-3 w-3" />
                Ausente
              </span>
            {/if}
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</ScrollArea>
