<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { X, ChevronDown } from "lucide-svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

  import type { Table } from "@tanstack/table-core";
  import type { StudentUserDTO } from "$lib/types/user.types";

  let { table } = $props<{
    table: Table<StudentUserDTO>;
  }>();

  const nameFilterValue = $derived(
    (table.getColumn("name")?.getFilterValue() as string) ?? "",
  );

  function clearFilter() {
    table.getColumn("name")?.setFilterValue("");
  }
</script>

<div class="flex items-center justify-between">
  <div class="flex flex-1 items-center space-x-2">
    <Input
      placeholder="Filtrar por nombre..."
      type="text"
      value={nameFilterValue}
      oninput={(e) =>
        table.getColumn("name")?.setFilterValue(e.currentTarget.value)}
      class="h-8 w-[150px] lg:w-[250px]"
    />

    {#if nameFilterValue}
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
