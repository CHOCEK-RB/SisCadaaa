<script lang="ts">
  import { MoreHorizontal } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

  export let studentId: string;

  function viewDetails() {
    console.log("View details for student ID:", studentId);
    // TODO: Implement navigation to student detail page
    // goto(`/secretary/students/${studentId}`);
  }

  function editStudent() {
    console.log("Edit student with ID:", studentId);
    // TODO: Implement navigation to edit student page
    // goto(`/secretary/students/${studentId}/edit`);
  }

  function deleteStudent() {
    console.log("Delete student with ID:", studentId);
    // TODO: Implement delete student logic
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
    <DropdownMenu.Item onclick={viewDetails}>
      Ver detalles del estudiante
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={editStudent}>
      Editar estudiante
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={deleteStudent}>
      Eliminar estudiante
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
