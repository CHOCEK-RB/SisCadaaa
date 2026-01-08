<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { X, ChevronDown } from "lucide-svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

  import type { Table } from "@tanstack/svelte-table";
  import type { TeacherUserDTO } from "./teacher-columns";

  let { filterValue = $bindable(""), table } = $props<{
    filterValue: string;
    table: Table<TeacherUserDTO>;
  }>();

  function clearFilter() {
    filterValue = "";
  }
</script>

<div class="flex items-center justify-between">
  <div class="flex flex-1 items-center space-x-2">
    <Input
      placeholder="Filtrar por nombre, email o CUI..."
      type="text"
      bind:value={filterValue}
      class="h-8 w-[150px] lg:w-[250px]"
    />

    {#if filterValue}
      <Button variant="ghost" onclick={clearFilter} class="h-8 px-2 lg:px-3">
        Reset
        <X class="ml-2 h-4 w-4" />
      </Button>
    {/if}
  </div>

  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button {...props} variant="outline" class="ml-auto">
          Columns <ChevronDown class="ml-2 h-4 w-4" />
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      {#each table
        .getAllColumns()
        .filter((col) => col.getCanHide()) as column (column.id)}
        <DropdownMenu.CheckboxItem
          class="capitalize"
          bind:checked={
            () => column.getIsVisible(), (v) => column.toggleVisibility(!!v)
          }
        >
          {column.id}
        </DropdownMenu.CheckboxItem>
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>
