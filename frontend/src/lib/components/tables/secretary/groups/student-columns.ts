import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "$lib/components/ui/data-table";
import TableColumnSort from "$lib/components/tables/utils/table-column-sort.svelte";

import type { StudentUserDTO } from "$lib/types/user.types";

export const studentColumns: ColumnDef<StudentUserDTO>[] = [
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
    accessorKey: "name",
    header: ({ column }) =>
      renderComponent(TableColumnSort, {
        column,
        title: "Nombre",
      }),
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
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

];
