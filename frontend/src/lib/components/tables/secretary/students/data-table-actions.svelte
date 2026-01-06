<script lang="ts">
  import { MoreHorizontal } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import EditStudentSheet from "./edit-student-sheet.svelte";
  import DeleteStudentDialog from "./delete-student-dialog.svelte";
  import type { StudentUserDTO } from "./student-columns";

  let { student } = $props<{ student: StudentUserDTO }>();

  let sheetOpen = $state(false);
  let dialogOpen = $state(false);

  function viewDetails() {
    console.log("View details for student ID:", student.id);
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="icon"
        class="relative size-8 p-0"
      >
        <span class="sr-only">Open menu</span>
        <MoreHorizontal />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Label>Acciones</DropdownMenu.Label>
    <DropdownMenu.Item onmousedown={viewDetails}>
      Ver detalles del estudiante
    </DropdownMenu.Item>
    <DropdownMenu.Item onmousedown={() => (sheetOpen = true)}>
      Editar estudiante
    </DropdownMenu.Item>
    <DropdownMenu.Item onmousedown={() => (dialogOpen = true)}>
      Eliminar estudiante
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<EditStudentSheet bind:open={sheetOpen} {student} />
<DeleteStudentDialog bind:open={dialogOpen} studentId={student.userId} />
