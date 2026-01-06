<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Column } from "@tanstack/table-core";
  import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

  interface DataTableColumnHeaderProps<TData, TValue> {
    column: Column<TData, TValue>;
    title: string;
    class?: string;
    sortable?: boolean;
    hideable?: boolean;
  }

  let {
    column,
    title,
    class: className,
    sortable = true,
    hideable = true,
  }: DataTableColumnHeaderProps<any, any> = $props();

  const handleSort = (direction: "asc" | "desc" | false) => {
    if (direction === false) {
      column.clearSorting();
    } else {
      column.toggleSorting(direction === "desc");
    }
  };
</script>

<div class={cn("flex items-center space-x-2", className)}>
  {#if sortable}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button
          variant="ghost"
          size="sm"
          class="-ml-3 h-8 data-[state=open]:bg-accent"
        >
          <span>{title}</span>
          {#if column.getIsSorted() === "asc"}
            <ArrowUp class="ml-2 h-4 w-4" />
          {:else if column.getIsSorted() === "desc"}
            <ArrowDown class="ml-2 h-4 w-4" />
          {:else}
            <ChevronsUpDown class="ml-2 h-4 w-4" />
          {/if}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start">
        <DropdownMenu.Item onclick={() => handleSort("asc")}>
          <ArrowUp class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Ascendente
        </DropdownMenu.Item>
        <DropdownMenu.Item onclick={() => handleSort("desc")}>
          <ArrowDown class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Descendente
        </DropdownMenu.Item>
        {#if column.getIsSorted()}
          <DropdownMenu.Separator />
          <DropdownMenu.Item onclick={() => handleSort(false)}>
            <ChevronsUpDown class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Sin orden
          </DropdownMenu.Item>
        {/if}
        {#if hideable}
          <DropdownMenu.Separator />
          <DropdownMenu.Item onclick={() => column.toggleVisibility(false)}>
            <EyeOff class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Ocultar columna
          </DropdownMenu.Item>
        {/if}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  {:else}
    <span class="text-sm font-medium">{title}</span>
  {/if}
</div>
