<script lang="ts">
  import type { GradesAndPercent } from "$lib/services/enrollment.service";
  import * as Table from "$lib/components/ui/table";
  import { Input } from "$lib/components/ui/input";
  import { createRawSnippet } from "svelte";
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

  type Props = {
    gradesData: GradesAndPercent[];
  };
  let { gradesData = [] }: Props = $props();

  interface GradeRow {
    courseName: string;
    courseCode: string;
    period: string;
    finalGrade: number;
    status: "Aprobado" | "Reprobado" | "Pendiente";
  }

  function getAcademicPeriodLabel(date: unknown): string {
    const d = date instanceof Date ? date : new Date(date as string | number);

    if (!date || isNaN(d.getTime())) {
      return "N/A";
    }

    const year = d.getFullYear();
    const month = d.getUTCMonth();
    return month >= 2 && month < 7 ? `${year}-A` : `${year}-B`;
  }

  const data: GradeRow[] = $derived(
    gradesData.map((item) => {
      let finalGrade = 0;
      if (item.grades && item.percent) {
        const g = item.grades;
        const p = item.percent;
        finalGrade =
          ((g.firstContinue ?? 0) * (p.firstContinue ?? 0)) / 100 +
          ((g.secondContinue ?? 0) * (p.secondContinue ?? 0)) / 100 +
          ((g.thirdContinue ?? 0) * (p.thirdContinue ?? 0)) / 100 +
          ((g.firstPartial ?? 0) * (p.firstPartial ?? 0)) / 100 +
          ((g.secondPartial ?? 0) * (p.secondPartial ?? 0)) / 100 +
          ((g.thirdPartial ?? 0) * (p.thirdPartial ?? 0)) / 100;
      }
      let status: GradeRow["status"] = "Pendiente";
      if (
        finalGrade > 0 ||
        (item.grades && Object.values(item.grades).some((g) => g !== null))
      ) {
        status = finalGrade >= 10.5 ? "Aprobado" : "Reprobado";
      }
      return {
        courseName: item.course.course?.name || "N/A",
        courseCode: item.course.course?.code || "N/A",
        period: getAcademicPeriodLabel(item.course.creationDate),
        finalGrade: finalGrade,
        status: status,
      };
    }),
  );

  const columns: ColumnDef<GradeRow>[] = [
    {
      accessorKey: "courseName",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, {
          column,
          title: "Curso",
        }),
      cell: ({ row }) => row.original.courseName,
    },
    {
      accessorKey: "courseCode",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, {
          column,
          title: "Código",
        }),
      cell: ({ row }) => row.original.courseCode,
    },
    {
      accessorKey: "period",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, {
          column,
          title: "Periodo",
        }),
      cell: ({ row }) => row.original.period,
    },
    {
      accessorKey: "finalGrade",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, {
          column,
          title: "Promedio Final",
        }),
      cell: ({ row }) => {
        const snippet = createRawSnippet(() => ({
          render: () =>
            `<div class="text-left font-medium">${row.original.finalGrade.toFixed(
              2,
            )}</div>`,
        }));
        return renderSnippet(snippet);
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const statusText = row.original.status;
        const statusSnippet = createRawSnippet<[{ status: string }]>(
          (getStatus) => {
            const { status } = getStatus();
            const baseClasses =
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
            const variantClasses =
              status === "Aprobado"
                ? "border-transparent bg-primary text-primary-foreground"
                : status === "Reprobado"
                  ? "border-transparent bg-destructive text-destructive-foreground"
                  : "border-transparent bg-secondary text-secondary-foreground";
            return {
              render: () =>
                `<div class="${baseClasses} ${variantClasses}">${status}</div>`,
            };
          },
        );
        return renderSnippet(statusSnippet, { status: statusText });
      },
    },
  ];

  let sorting: SortingState = $state([{ id: "period", desc: true }]);
  let columnFilters: ColumnFiltersState = $state([]);

  const table = createSvelteTable({
    get data() {
      return data;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) =>
      (sorting = typeof updater === "function" ? updater(sorting) : updater),
    onColumnFiltersChange: (updater) =>
      (columnFilters =
        typeof updater === "function" ? updater(columnFilters) : updater),
    get state() {
      return {
        get sorting() {
          return sorting;
        },
        get columnFilters() {
          return columnFilters;
        },
      };
    },
  });
</script>

<div class="w-full space-y-4">
  <div class="flex items-center">
    <Input
      placeholder="Filtrar por nombre de curso..."
      value={(table.getColumn("courseName")?.getFilterValue() as string) ?? ""}
      oninput={(e) =>
        table.getColumn("courseName")?.setFilterValue(e.currentTarget.value)}
      class="max-w-sm"
    />
  </div>
  <div class="rounded-md border">
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
                <Table.Cell>
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
</div>
