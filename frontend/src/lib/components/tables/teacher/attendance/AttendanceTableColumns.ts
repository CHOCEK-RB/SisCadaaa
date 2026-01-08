import { type ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import DataTableColumnHeader from "$lib/components/tables/utils/table-column-sort.svelte";
import AttendanceTableCell from "./AttendanceTableCell.svelte";

export type StudentStats = {
  cui: string;
  name: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
};

export const columns: ColumnDef<StudentStats>[] = [
  {
    accessorKey: "cui",
    id: "cui",
    header: ({ column }) =>
      renderComponent(DataTableColumnHeader, {
        column,
        title: "CUI",
        class: "justify-center",
      }),
    cell: ({ row }) => row.original.cui, // Simple string, styling in parent
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "name",
    id: "name",
    header: ({ column }) =>
      renderComponent(DataTableColumnHeader, {
        column,
        title: "Estudiante",
      }),
    cell: ({ row }) =>
      renderComponent(AttendanceTableCell, {
        value: row.original.name,
        textColorClass: "text-left",
      }),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "present",
    id: "present",
    header: ({ column }) =>
      renderComponent(DataTableColumnHeader, {
        column,
        title: "Presentes",
        class: "justify-center",
      }),
    cell: ({ row }) =>
      renderComponent(AttendanceTableCell, {
        value: row.original.present,
        textColorClass: "text-center text-green-600",
      }),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "absent",
    id: "absent",
    header: ({ column }) =>
      renderComponent(DataTableColumnHeader, {
        column,
        title: "Ausentes",
        class: "justify-center",
      }),
    cell: ({ row }) =>
      renderComponent(AttendanceTableCell, {
        value: row.original.absent,
        textColorClass: "text-red-600",
      }),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "total",
    id: "total",
    header: ({ column }) =>
      renderComponent(DataTableColumnHeader, {
        column,
        title: "Total",
        class: "justify-center",
      }),
    cell: ({ row }) =>
      renderComponent(AttendanceTableCell, {
        value: row.original.total,
      }),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "percentage",
    id: "percentage",
    header: ({ column }) =>
      renderComponent(DataTableColumnHeader, {
        column,
        title: "% Asist.",
        class: "justify-center",
      }),
    cell: ({ row }) => {
      const percentage = row.original.percentage;
      const textColorClass =
        percentage < 70 ? "text-red-600" : "text-green-600";
      return renderComponent(AttendanceTableCell, {
        value: `${percentage}%`,
        textColorClass: textColorClass,
      });
    },
    enableSorting: true,
    enableHiding: true,
  },
];

