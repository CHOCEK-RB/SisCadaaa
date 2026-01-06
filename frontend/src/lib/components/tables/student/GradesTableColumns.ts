import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "$lib/components/ui/data-table/index.js";

import DataTableColumnHeader from "$lib/components/tables/utils/table-column-sort.svelte";
import StatusBadge from "../utils/StatusGradesBadge.svelte";

export interface GradeRow {
  courseName: string;
  courseCode: string;
  period: string;
  finalGrade: number;
  status: "Aprobado" | "Reprobado" | "Pendiente";
}

export const columns: ColumnDef<GradeRow>[] = [
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
    cell: ({ row }) => row.original.finalGrade.toFixed(2),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) =>
      renderComponent(StatusBadge, {
        status: row.original.status,
      }),
  },
];
