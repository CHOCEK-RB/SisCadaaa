import type { ColumnDef } from "@tanstack/svelte-table";
import { renderComponent } from "$lib/components/ui/data-table";
import TableColumnSort from "$lib/components/tables/utils/table-column-sort.svelte";
import DataTableActions from "./data-table-actions.svelte";

export interface StudentUserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "student";
  cui: string;
  semester: number;
  isActive: boolean;
}

export const columns: ColumnDef<StudentUserDTO>[] = [
  {
    accessorKey: "name",
    header: ({ column }) =>
      renderComponent(TableColumnSort, {
        column,
        title: "Nombre",
      }),
    cell: ({ row }) => {
      const { firstName, lastName } = row.original;
      return `${firstName} ${lastName}`;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) =>
      renderComponent(TableColumnSort, {
        column,
        title: "Email",
      }),
    cell: ({ row }) => row.original.email,
  },
  {
    accessorKey: "cui",
    header: ({ column }) =>
      renderComponent(TableColumnSort, {
        column,
        title: "CUI",
      }),
    cell: ({ row }) => row.original.cui,
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return renderComponent(DataTableActions, { studentId: row.original.id });
    },
  },
];
