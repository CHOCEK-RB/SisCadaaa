<script lang="ts">
  import { MoreHorizontal } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

  export let studentId: string | undefined = undefined;
  export let teacherId: string | undefined = undefined;

  const id = studentId ?? teacherId;

  function viewDetails() {
    console.log("View details for ID:", id);
    // TODO: Implement navigation to detail page
  }

  function edit() {
    console.log("Edit with ID:", id);
    // TODO: Implement navigation to edit page
  }

  function remove() {
    console.log("Delete with ID:", id);
    // TODO: Implement delete logic
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
    <DropdownMenu.Item onclick={viewDetails}>Ver detalles</DropdownMenu.Item>
    <DropdownMenu.Item onclick={edit}>Editar</DropdownMenu.Item>
    <DropdownMenu.Item onclick={remove}>Eliminar</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
