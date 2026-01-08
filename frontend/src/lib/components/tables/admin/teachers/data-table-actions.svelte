<script lang="ts">
  import { MoreHorizontal } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import EditTeacherSheet from "./edit-teacher-sheet.svelte";
  import DeleteTeacherDialog from "./delete-teacher-dialog.svelte";
  import type { TeacherUserDTO } from "./teacher-columns";
  import { goto } from "$app/navigation";

  let { teacher } = $props<{ teacher: TeacherUserDTO }>();

  let sheetOpen = $state(false);
  let dialogOpen = $state(false);

  function viewDetails() {
    goto(`/admin/search/teacher/${teacher.id}`);
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
      Ver detalles del profesor
    </DropdownMenu.Item>
    <DropdownMenu.Item onmousedown={() => (sheetOpen = true)}>
      Editar profesor
    </DropdownMenu.Item>
    <DropdownMenu.Item onmousedown={() => (dialogOpen = true)}>
      Eliminar profesor
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<EditTeacherSheet bind:open={sheetOpen} {teacher} />
<DeleteTeacherDialog bind:open={dialogOpen} teacherId={teacher.userId} />
