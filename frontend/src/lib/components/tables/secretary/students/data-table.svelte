<script lang="ts">
  import {
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    type VisibilityState,
  } from "@tanstack/table-core";
  import {
    FlexRender,
    createSvelteTable,
  } from "$lib/components/ui/data-table/index.js";
  import { writable } from "svelte/store";
  import * as Table from "$lib/components/ui/table";
  import DataTablePagination from "$lib/components/tables/utils/data-table-pagination.svelte";
  import DataTableToolbar from "./data-table-toolbar.svelte";
  import type { StudentUserDTO } from "./student-columns";
  import type { ColumnDef } from "@tanstack/svelte-table";

  let {
    data,
    columns,
    filterValue = $bindable(""),
    pageIndex = $bindable(0),
    pageSize = $bindable(10),
    pageCount,
    sorting = $bindable([]),
    columnVisibility = $bindable({}),
  } = $props<{
    data: StudentUserDTO[];
    columns: ColumnDef<StudentUserDTO>[];
    filterValue?: string;
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    sorting: SortingState;
    columnVisibility: VisibilityState;
  }>();

  const rowSelection = writable({});

  const table = createSvelteTable<StudentUserDTO>({
    get data() {
      return data;
    },
    columns,
    getRowId: (row) => row.userId,
    state: {
      get sorting() {
        return sorting;
      },
      get columnVisibility() {
        return columnVisibility;
      },
      get rowSelection() {
        return $rowSelection;
      },
      get pagination() {
        return { pageIndex, pageSize };
      },
    },
    enableRowSelection: true,
    onSortingChange: (updater) =>
      (sorting = typeof updater === "function" ? updater(sorting) : updater),
    onColumnVisibilityChange: (updater) =>
      (columnVisibility =
        typeof updater === "function" ? updater(columnVisibility) : updater),
    onRowSelectionChange: (updater) =>
      rowSelection.set(
        typeof updater === "function" ? updater($rowSelection) : updater,
      ),
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      pageIndex = newState.pageIndex;
      pageSize = newState.pageSize;
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: pageCount,
  });
</script>

<div class="space-y-4">
  <DataTableToolbar {table} bind:filterValue />
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
            <Table.Row data-state={row.getIsSelected() && "selected"}>
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
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              No se encontraron resultados.
            </Table.Cell>
          </Table.Row>
        {/if}
      </Table.Body>
    </Table.Root>
  </div>
  <DataTablePagination {table} />
</div>
