<script lang="ts">
  import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    type ColumnFiltersState,
    type VisibilityState,
  } from "@tanstack/table-core";
  import {
    FlexRender,
    createSvelteTable,
  } from "$lib/components/ui/data-table/index.js";
  import * as Table from "$lib/components/ui/table";
  import type { StudentUserDTO } from "$lib/types/user.types";
  import { studentColumns } from "./student-columns";
  import StudentDataTableToolbar from "./data-table-toolbar.svelte";

  let { data, onRowClick } = $props<{
    data: StudentUserDTO[];
    onRowClick?: (row: StudentUserDTO) => void;
  }>();

  let sorting = $state<SortingState>([]);
  let columnFilters = $state<ColumnFiltersState>([]);
  let columnVisibility = $state<VisibilityState>({});
  let rowSelection = $state({});

  const table = createSvelteTable<StudentUserDTO>({
    get data() {
      return data;
    },
    columns: studentColumns,
    getRowId: (row) => row.id,
    state: {
      get sorting() {
        return sorting;
      },
      get columnFilters() {
        return columnFilters;
      },
      get columnVisibility() {
        return columnVisibility;
      },
      get rowSelection() {
        return rowSelection;
      },
    },
    enableRowSelection: true,
    onSortingChange: (updater) =>
      (sorting = typeof updater === "function" ? updater(sorting) : updater),
    onColumnFiltersChange: (updater) =>
      (columnFilters =
        typeof updater === "function" ? updater(columnFilters) : updater),
    onColumnVisibilityChange: (updater) =>
      (columnVisibility =
        typeof updater === "function" ? updater(columnVisibility) : updater),
    onRowSelectionChange: (updater) =>
      (rowSelection =
        typeof updater === "function" ? updater(rowSelection) : updater),

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    manualSorting: false,
    manualFiltering: false,
  });
</script>

<div class="space-y-4">
  <StudentDataTableToolbar {table} />
  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head class="[&:has([role=checkbox])]:pl-3">
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
            <Table.Row
              data-state={row.getIsSelected() && "selected"}
              class={onRowClick ? "cursor-pointer" : ""}
              onmousedown={() => onRowClick?.(row.original)}
            >
              {#each row.getVisibleCells() as cell (cell.id)}
                <Table.Cell class="[&:has([role=checkbox])]:pl-3">
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
              colspan={studentColumns.length}
              class="h-24 text-center"
            >
              No se encontraron resultados.
            </Table.Cell>
          </Table.Row>
        {/if}
      </Table.Body>
    </Table.Root>
  </div>
</div>
