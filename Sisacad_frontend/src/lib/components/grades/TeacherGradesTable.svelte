<script lang="ts">
  import type {
    GroupGradesResponse,
    StudentGradeInfo,
  } from "$lib/services/groups.service";
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
    groupGradesData: GroupGradesResponse;
    canEdit: boolean;
    pendingChanges: Map<string, Partial<any>>;
    onSelectStudent: (student: StudentGradeInfo) => void;
    onGradeChange: (payload: {
      enrollmentId: string;
      gradeKey: string;
      value: number | null;
    }) => void;
  };
  let {
    groupGradesData,
    canEdit,
    pendingChanges,
    onSelectStudent,
    onGradeChange,
  }: Props = $props();

  interface GradeRow {
    studentId: string;
    enrollmentId: string; // Added enrollmentId
    cui: string;
    fullName: string;
    firstName: string;
    lastName: string;
    grades: StudentGradeInfo["grades"]; // Store original grades
    firstContinue: number | null;
    secondContinue: number | null;
    thirdContinue: number | null;
    firstPartial: number | null;
    secondPartial: number | null;
    thirdPartial: number | null;
    finalGrade: number;
    status: "Aprobado" | "Reprobado" | "Pendiente";
  }

  function getGradeColor(grade: number | null): string {
    if (grade === null || grade < 0) return "text-gray-400";
    if (grade >= 10.5) return "text-green-600 font-semibold";
    return "text-red-600 font-semibold";
  }

  const data: GradeRow[] = $derived(
    groupGradesData.students.map((student: StudentGradeInfo) => {
      const g = student.grades;
      const p = groupGradesData.gradingScheme;

      let finalGrade = 0;
      let hasSomeGrade = false;

      if (g && p) {
        finalGrade =
          ((g.firstContinue ?? 0) * (p.firstContinue ?? 0)) / 100 +
          ((g.secondContinue ?? 0) * (p.secondContinue ?? 0)) / 100 +
          ((g.thirdContinue ?? 0) * (p.thirdContinue ?? 0)) / 100 +
          ((g.firstPartial ?? 0) * (p.firstPartial ?? 0)) / 100 +
          ((g.secondPartial ?? 0) * (p.secondPartial ?? 0)) / 100 +
          ((g.thirdPartial ?? 0) * (p.thirdPartial ?? 0)) / 100;

        hasSomeGrade = Object.values(g).some((grade) => grade !== null);
      }

      let status: GradeRow["status"] = "Pendiente";
      if (hasSomeGrade) {
        status = finalGrade >= 10.5 ? "Aprobado" : "Reprobado";
      }

      return {
        studentId: student.studentId,
        enrollmentId: student.enrollmentId,
        cui: student.cui,
        fullName: `${student.firstName} ${student.lastName}`,
        firstName: student.firstName,
        lastName: student.lastName,
        grades: student.grades,
        firstContinue: student.grades.firstContinue,
        secondContinue: student.grades.secondContinue,
        thirdContinue: student.grades.thirdContinue,
        firstPartial: student.grades.firstPartial,
        secondPartial: student.grades.secondPartial,
        thirdPartial: student.grades.thirdPartial,
        finalGrade: finalGrade,
        status: status,
      };
    }),
  );

  const columns: ColumnDef<GradeRow>[] = [
    {
      accessorKey: "fullName",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, {
          column,
          title: "Estudiante",
        }),
      cell: ({ row }) => {
        const student = row.original;
        return renderSnippet(
          createRawSnippet(() => ({
            render: () => `
              <div class="cursor-pointer hover:underline" onclick=${() => onSelectStudent(student)}>
                ${student.fullName}
              </div>
            `,
          })),
        );
      },
    },
    {
      accessorKey: "cui",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, {
          column,
          title: "CUI",
        }),
      cell: ({ row }) => row.original.cui,
    },
    {
      accessorKey: "firstContinue",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, {
          column,
          title: "C1",
        }),
      cell: ({ row }) => {
        const gradeKey = "firstContinue";
        const enrollmentId = row.original.enrollmentId;
        const currentGrade = row.original.firstContinue;
        const pendingValue = pendingChanges.get(enrollmentId)?.[gradeKey];
        const displayValue =
          pendingValue !== undefined ? pendingValue : (currentGrade ?? "");

        return renderSnippet(
          createRawSnippet(() => ({
            render: () => `
              <div class="text-center">
                ${
                  canEdit
                    ? `<input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value="${displayValue}"
                    oninput="${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      let value: number | null = parseFloat(target.value);
                      if (isNaN(value)) value = null;
                      if (value !== null && (value < 0 || value > 20)) {
                        target.value =
                          currentGrade !== null ? String(currentGrade) : "";
                        return;
                      }
                      onGradeChange({
                        enrollmentId,
                        gradeKey,
                        value,
                      });
                    }}"
                    class="w-16 rounded border px-2 py-1 text-center text-sm ${getGradeColor(pendingValue !== undefined ? pendingValue : currentGrade)}"
                    placeholder="-"
                  />`
                    : `<span class="text-sm ${getGradeColor(currentGrade)}">${currentGrade !== null ? currentGrade.toFixed(1) : "-"}</span>`
                }
              </div>
            `,
          })),
        );
      },
    },
    {
      accessorKey: "secondContinue",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, {
          column,
          title: "C2",
        }),
      cell: ({ row }) => {
        const gradeKey = "secondContinue";
        const enrollmentId = row.original.enrollmentId;
        const currentGrade = row.original.secondContinue;
        const pendingValue = pendingChanges.get(enrollmentId)?.[gradeKey];
        const displayValue =
          pendingValue !== undefined ? pendingValue : (currentGrade ?? "");

        return renderSnippet(
          createRawSnippet(() => ({
            render: () => `
              <div class="text-center">
                ${
                  canEdit
                    ? `<input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value="${displayValue}"
                    oninput="${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      let value: number | null = parseFloat(target.value);
                      if (isNaN(value)) value = null;
                      if (value !== null && (value < 0 || value > 20)) {
                        target.value =
                          currentGrade !== null ? String(currentGrade) : "";
                        return;
                      }
                      onGradeChange({
                        enrollmentId,
                        gradeKey,
                        value,
                      });
                    }}"
                    class="w-16 rounded border px-2 py-1 text-center text-sm ${getGradeColor(pendingValue !== undefined ? pendingValue : currentGrade)}"
                    placeholder="-"
                  />`
                    : `<span class="text-sm ${getGradeColor(currentGrade)}">${currentGrade !== null ? currentGrade.toFixed(1) : "-"}</span>`
                }
              </div>
            `,
          })),
        );
      },
    },
    {
      accessorKey: "thirdContinue",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, {
          column,
          title: "C3",
        }),
      cell: ({ row }) => {
        const gradeKey = "thirdContinue";
        const enrollmentId = row.original.enrollmentId;
        const currentGrade = row.original.thirdContinue;
        const pendingValue = pendingChanges.get(enrollmentId)?.[gradeKey];
        const displayValue =
          pendingValue !== undefined ? pendingValue : (currentGrade ?? "");

        return renderSnippet(
          createRawSnippet(() => ({
            render: () => `
              <div class="text-center">
                ${
                  canEdit
                    ? `<input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value="${displayValue}"
                    oninput="${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      let value: number | null = parseFloat(target.value);
                      if (isNaN(value)) value = null;
                      if (value !== null && (value < 0 || value > 20)) {
                        target.value =
                          currentGrade !== null ? String(currentGrade) : "";
                        return;
                      }
                      onGradeChange({
                        enrollmentId,
                        gradeKey,
                        value,
                      });
                    }}"
                    class="w-16 rounded border px-2 py-1 text-center text-sm ${getGradeColor(pendingValue !== undefined ? pendingValue : currentGrade)}"
                    placeholder="-"
                  />`
                    : `<span class="text-sm ${getGradeColor(currentGrade)}">${currentGrade !== null ? currentGrade.toFixed(1) : "-"}</span>`
                }
              </div>
            `,
          })),
        );
      },
    },
    {
      accessorKey: "firstPartial",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, {
          column,
          title: "P1",
        }),
      cell: ({ row }) => {
        const gradeKey = "firstPartial";
        const enrollmentId = row.original.enrollmentId;
        const currentGrade = row.original.firstPartial;
        const pendingValue = pendingChanges.get(enrollmentId)?.[gradeKey];
        const displayValue =
          pendingValue !== undefined ? pendingValue : (currentGrade ?? "");

        return renderSnippet(
          createRawSnippet(() => ({
            render: () => `
              <div class="text-center">
                ${
                  canEdit
                    ? `<input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value="${displayValue}"
                    oninput="${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      let value: number | null = parseFloat(target.value);
                      if (isNaN(value)) value = null;
                      if (value !== null && (value < 0 || value > 20)) {
                        target.value =
                          currentGrade !== null ? String(currentGrade) : "";
                        return;
                      }
                      onGradeChange({
                        enrollmentId,
                        gradeKey,
                        value,
                      });
                    }}"
                    class="w-16 rounded border px-2 py-1 text-center text-sm ${getGradeColor(pendingValue !== undefined ? pendingValue : currentGrade)}"
                    placeholder="-"
                  />`
                    : `<span class="text-sm ${getGradeColor(currentGrade)}">${currentGrade !== null ? currentGrade.toFixed(1) : "-"}</span>`
                }
              </div>
            `,
          })),
        );
      },
    },
    {
      accessorKey: "secondPartial",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, {
          column,
          title: "P2",
        }),
      cell: ({ row }) => {
        const gradeKey = "secondPartial";
        const enrollmentId = row.original.enrollmentId;
        const currentGrade = row.original.secondPartial;
        const pendingValue = pendingChanges.get(enrollmentId)?.[gradeKey];
        const displayValue =
          pendingValue !== undefined ? pendingValue : (currentGrade ?? "");

        return renderSnippet(
          createRawSnippet(() => ({
            render: () => `
              <div class="text-center">
                ${
                  canEdit
                    ? `<input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value="${displayValue}"
                    oninput="${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      let value: number | null = parseFloat(target.value);
                      if (isNaN(value)) value = null;
                      if (value !== null && (value < 0 || value > 20)) {
                        target.value =
                          currentGrade !== null ? String(currentGrade) : "";
                        return;
                      }
                      onGradeChange({
                        enrollmentId,
                        gradeKey,
                        value,
                      });
                    }}"
                    class="w-16 rounded border px-2 py-1 text-center text-sm ${getGradeColor(pendingValue !== undefined ? pendingValue : currentGrade)}"
                    placeholder="-"
                  />`
                    : `<span class="text-sm ${getGradeColor(currentGrade)}">${currentGrade !== null ? currentGrade.toFixed(1) : "-"}</span>`
                }
              </div>
            `,
          })),
        );
      },
    },
    {
      accessorKey: "thirdPartial",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader, {
          column,
          title: "P3",
        }),
      cell: ({ row }) => {
        const gradeKey = "thirdPartial";
        const enrollmentId = row.original.enrollmentId;
        const currentGrade = row.original.thirdPartial;
        const pendingValue = pendingChanges.get(enrollmentId)?.[gradeKey];
        const displayValue =
          pendingValue !== undefined ? pendingValue : (currentGrade ?? "");

        return renderSnippet(
          createRawSnippet(() => ({
            render: () => `
              <div class="text-center">
                ${
                  canEdit
                    ? `<input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value="${displayValue}"
                    oninput="${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      let value: number | null = parseFloat(target.value);
                      if (isNaN(value)) value = null;
                      if (value !== null && (value < 0 || value > 20)) {
                        target.value =
                          currentGrade !== null ? String(currentGrade) : "";
                        return;
                      }
                      onGradeChange({
                        enrollmentId,
                        gradeKey,
                        value,
                      });
                    }}"
                    class="w-16 rounded border px-2 py-1 text-center text-sm ${getGradeColor(pendingValue !== undefined ? pendingValue : currentGrade)}"
                    placeholder="-"
                  />`
                    : `<span class="text-sm ${getGradeColor(currentGrade)}">${currentGrade !== null ? currentGrade.toFixed(1) : "-"}</span>`
                }
              </div>
            `,
          })),
        );
      },
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

  let sorting: SortingState = $state([]);
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
      placeholder="Filtrar por nombre de estudiante..."
      value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
      oninput={(e) =>
        table.getColumn("fullName")?.setFilterValue(e.currentTarget.value)}
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

