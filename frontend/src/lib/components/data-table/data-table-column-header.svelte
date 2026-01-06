<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Column } from "@tanstack/table-core";
  import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";

  interface DataTableColumnHeaderProps<TData, TValue> {
    column: Column<TData, TValue>;
    title: string;
    class?: string;
  }

  let {
    column,
    title,
    class: className,
  }: DataTableColumnHeaderProps<any, any> = $props();
</script>

<div class={cn("flex items-center space-x-2", className)}>
  <Button
    variant="ghost"
    onclick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  >
    {title}
    {#if column.getIsSorted() === "asc"}
      <ArrowUp class="ml-2 h-4 w-4" />
    {:else if column.getIsSorted() === "desc"}
      <ArrowDown class="ml-2 h-4 w-4" />
    {:else}
      <ChevronsUpDown class="ml-2 h-4 w-4" />
    {/if}
  </Button>
</div>
