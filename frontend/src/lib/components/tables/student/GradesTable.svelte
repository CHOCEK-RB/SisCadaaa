<script lang="ts">
  import type { GradesAndPercent } from "$lib/services/enrollment.service";
  import * as Table from "$lib/components/ui/table";
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

  import { columns, type GradeRow } from "./GradesTableColumns";

  type Props = {
    gradesData: GradesAndPercent[];
  };
  let { gradesData = [] }: Props = $props();

  function getAcademicPeriodLabel(date: unknown): string {
    if (!date) return "N/A";

    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else if (typeof date === "string" || typeof date === "number") {
      d = new Date(date);
    } else {
      return "N/A";
    }

    if (isNaN(d.getTime())) return "N/A";

    const year = d.getFullYear();
    const month = d.getUTCMonth();
    return month >= 2 && month < 7 ? `${year}-A` : `${year}-B`;
  }

  function calculateFinalGrade(grades: any, percent: any): number {
    if (!grades || !percent) return 0;

    let total = 0;
    const components = [
      ["firstContinue", "firstContinue"],
      ["secondContinue", "secondContinue"],
      ["thirdContinue", "thirdContinue"],
      ["firstPartial", "firstPartial"],
      ["secondPartial", "secondPartial"],
      ["thirdPartial", "thirdPartial"],
    ] as const;

    for (const [gradeKey, percentKey] of components) {
      const grade = grades[gradeKey];
      const weight = percent[percentKey];
      if (grade != null && weight != null) {
        total += (grade * weight) / 100;
      }
    }

    return Number(total.toFixed(2));
  }

  const data: GradeRow[] = $derived(
    gradesData.map((item) => {
      const finalGrade = calculateFinalGrade(item.grades, item.percent);

      let status: GradeRow["status"] = "Pendiente";
      const hasGrades =
        item.grades && Object.values(item.grades).some((g) => g != null);

      if (hasGrades) {
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

  let sorting = $state<SortingState>([{ id: "period", desc: true }]);
  let columnFilters = $state<ColumnFiltersState>([]);
  let columnVisibility = $state<VisibilityState>({});

  const table = createSvelteTable({
    get data() {
      return data;
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

<div class="w-full space-y-4">
  <div class="flex items-center">
    <Input
      placeholder="Filtrar por nombre de curso..."
      value={(table.getColumn("courseName")?.getFilterValue() as string) ?? ""}
      oninput={(e) =>
        table.getColumn("courseName")?.setFilterValue(e.currentTarget.value)}
      class="max-w-sm"
    />

    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="outline" class="ms-auto">
            Columns <ChevronDownIcon class="ms-2 size-4" />
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {#each table
          .getAllColumns()
          .filter((col) => col.getCanHide()) as column (column)}
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
          {#each table.getRowModel().rows as row (row)}
            <Table.Row>
              {#each row.getVisibleCells() as cell (cell)}
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
