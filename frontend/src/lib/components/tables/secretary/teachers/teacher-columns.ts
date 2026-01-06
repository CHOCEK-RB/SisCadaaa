import type { ColumnDef } from "@tanstack/svelte-table";
import { renderComponent } from "$lib/components/ui/data-table";
import TableColumnSort from "$lib/components/tables/utils/table-column-sort.svelte";
import DataTableActions from "./data-table-actions.svelte";

export interface TeacherUserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "teacher";
  isActive: boolean;
}

export const columns: ColumnDef<TeacherUserDTO>[] = [
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
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return renderComponent(DataTableActions, { teacherId: row.original.id });
    },
  },
];
