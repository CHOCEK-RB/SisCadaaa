<script lang="ts">
  import type {
    GroupGradesResponse,
    StudentGradeInfo,
  } from "$lib/services/groups.service";
  import * as Table from "$lib/components/ui/table";
  import { Input } from "$lib/components/ui/input";
  import {
    createSvelteTable,
    FlexRender,
    renderComponent,
    renderSnippet,
  } from "$lib/components/ui/data-table";
  import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
  } from "@tanstack/table-core";
  import DataTableColumnHeader from "$lib/components/data-table/data-table-column-header.svelte";
  import { createRawSnippet } from "svelte";
  import EditStudentGradesDialog from "./EditStudentGradesDialog.svelte";
  import UploadGradesDialog from "./UploadGradesDialog.svelte";

  let { groupGradesData } = $props<{ groupGradesData: GroupGradesResponse }>();

  let sorting = $state<SortingState>([]);
  let columnFilters = $state<ColumnFiltersState>([]);

  let tableData = $derived(groupGradesData.students.map(mapStudentToRow));

  function mapStudentToRow(student: StudentGradeInfo) {
    const g = student.grades || {};
    return {
      enrollmentId: student.enrollmentId,
      cui: student.cui,
      fullName: `${student.firstName} ${student.lastName}`,
      firstContinue: g.firstContinue,
      secondContinue: g.secondContinue,
      thirdContinue: g.thirdContinue,
      firstPartial: g.firstPartial,
      secondPartial: g.secondPartial,
      thirdPartial: g.thirdPartial,
    };
  }

  const baseColumns = $derived<ColumnDef<any>[]>([
    {
      accessorKey: "fullName",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, { column, title: "Estudiante" }),
      cell: ({ row }) => row.original.fullName,
    },
    {
      accessorKey: "cui",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, { column, title: "CUI" }),
      cell: ({ row }) => row.original.cui,
    },

    createReadOnlyColumn("firstContinue", "C1"),
    createReadOnlyColumn("secondContinue", "C2"),
    createReadOnlyColumn("thirdContinue", "C3"),
    createReadOnlyColumn("firstPartial", "P1"),
    createReadOnlyColumn("secondPartial", "P2"),
    createReadOnlyColumn("thirdPartial", "P3"),
    {
      id: "final",
      header: "Prom.",
      cell: ({ row }) => {
        const s = row.original;
        const p = groupGradesData.gradingScheme;
        const final = (
          (Number(s.firstContinue || 0) * (p.firstContinue || 0)) / 100 +
          (Number(s.secondContinue || 0) * (p.secondContinue || 0)) / 100 +
          (Number(s.thirdContinue || 0) * (p.thirdContinue || 0)) / 100 +
          (Number(s.firstPartial || 0) * (p.firstPartial || 0)) / 100 +
          (Number(s.secondPartial || 0) * (p.secondPartial || 0)) / 100 +
          (Number(s.thirdPartial || 0) * (p.thirdPartial || 0)) / 100
        ).toFixed(1);

        const colorClass =
          Number(final) >= 10.5 ? "text-green-600" : "text-red-600";
        return renderSnippet(
          createRawSnippet(() => ({
            render: () => `<div class="font-bold ${colorClass}">${final}</div>`,
          })),
        );
      },
    },
  ]);

  const actionsColumn: ColumnDef<any> = {
    id: "actions",
    header: "Acción",
    cell: ({ row }) =>
      renderComponent(EditStudentGradesDialog, {
        student: row.original,
        groupId: groupGradesData.groupId,
      }),
  };

  const displayColumns = $derived<ColumnDef<any>[]>(
    groupGradesData.canEdit ? [...baseColumns, actionsColumn] : baseColumns,
  );

  function createReadOnlyColumn(key: string, title: string): ColumnDef<any> {
    return {
      accessorKey: key,
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, { column, title }),
      cell: ({ row }) => {
        const val = row.getValue(key);
        return val !== null && val !== undefined ? val : "-";
      },
    };
  }

  const table = createSvelteTable({
    get data() {
      return tableData;
    },
    get columns() {
      return displayColumns;
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) =>
      (sorting = typeof updater === "function" ? updater(sorting) : updater),
    onColumnFiltersChange: (updater) =>
      (columnFilters =
        typeof updater === "function" ? updater(columnFilters) : updater),
    state: {
      get sorting() {
        return sorting;
      },
      get columnFilters() {
        return columnFilters;
      },
    },
  });
</script>

<div class="w-full space-y-4">
  <div class="flex items-center justify-between gap-4 p-1">
    <Input
      placeholder="Filtrar por estudiante..."
      value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
      oninput={(e) =>
        table.getColumn("fullName")?.setFilterValue(e.currentTarget.value)}
      class="max-w-sm"
    />

    {#if groupGradesData.canEdit}
      <UploadGradesDialog {groupGradesData} />
    {/if}
  </div>

  <div class="rounded-md border shadow-sm">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head class="text-center">
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
                <Table.Cell class="p-2 text-center">
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
              colspan={displayColumns.length}
              class="h-24 text-center"
            >
              No se encontraron estudiantes.
            </Table.Cell>
          </Table.Row>
        {/if}
      </Table.Body>
    </Table.Root>
  </div>
</div>
