<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import { TrendingUp } from "lucide-svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { createSvelteTable, FlexRender } from "$lib/components/ui/data-table";
  import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    type ColumnFiltersState,
    type VisibilityState,
  } from "@tanstack/table-core";

  import { columns, type StudentStats } from "./AttendanceTableColumns";

  let { studentStats = [] } = $props<{ studentStats: StudentStats[] }>();

  let sorting = $state<SortingState>([]);
  let columnFilters = $state<ColumnFiltersState>([]);
  let columnVisibility = $state<VisibilityState>({});

  const table = createSvelteTable({
    get data() {
      return studentStats;
    },
    columns,
    get state() {
      return {
        get sorting() {
          return sorting;
        },
        get columnFilters() {
          return columnFilters;
        },
        get columnVisibility() {
          return columnVisibility;
        },
      };
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) =>
      (sorting = typeof updater === "function" ? updater(sorting) : updater),
    onColumnFiltersChange: (updater) =>
      (columnFilters =
        typeof updater === "function" ? updater(columnFilters) : updater),
    onColumnVisibilityChange: (updater) =>
      (columnVisibility =
        typeof updater === "function" ? updater(columnVisibility) : updater),
  });
</script>

<div class="space-y-4">
  <div class="flex items-center gap-2 text-lg font-semibold text-foreground">
    <TrendingUp class="h-5 w-5 text-primary" />
    <h2>Resumen Académico</h2>
  </div>

  <div class="flex items-center">
    <Input
      placeholder="Filtrar por nombre de estudiante..."
      value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
      oninput={(e) =>
        table.getColumn("name")?.setFilterValue(e.currentTarget.value)}
      class="max-w-sm"
    />

    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="outline" class="ms-auto">
            Columnas <ChevronDownIcon class="ms-2 size-4" />
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

  <div class="rounded-md border text-card-foreground shadow-sm">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head>
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#if table.getRowModel().rows.length > 0}
          {#each table.getRowModel().rows as row (row.id)}
            <Table.Row>
              {#each row.getVisibleCells() as cell (cell.id)}
                <Table.Cell class="text-center">
                  <FlexRender
                    content={cell.column.columnDef.cell}
                    context={cell.getContext()}
                  />
                </Table.Cell>
              {/each}
            </Table.Row>
          {/each}
        {:else}
          <Table.Row>
            <Table.Cell
              colspan={columns.length}
              class="h-24 text-center text-muted-foreground"
            >
              No se encontraron estudiantes inscritos en este grupo.
            </Table.Cell>
          </Table.Row>
        {/if}
      </Table.Body>
    </Table.Root>
  </div>
</div>
