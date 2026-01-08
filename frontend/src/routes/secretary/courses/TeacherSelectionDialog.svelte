<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Input from "$lib/components/ui/input";
  import { userService } from "$lib/services/user.service";
  import { toast } from "svelte-sonner";
  import {
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type SortingState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
  } from "@tanstack/table-core";
  import {
    FlexRender,
    createSvelteTable,
    renderComponent,
  } from "$lib/components/ui/data-table/index.js";

  import * as Table from "$lib/components/ui/table";
  import { Button } from "$lib/components/ui/button";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import SelectButtonCell from "./SelectButtonCell.svelte";

  export type TeacherData = {
    id: string;
    name: string;
    email: string;
  };

  let { onSelect } = $props<{
    onSelect: (teacher: TeacherData) => void;
  }>();

  let teachers = $state<TeacherData[]>([]);

  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
  let sorting = $state<SortingState>([]);
  let columnFilters = $state<ColumnFiltersState>([]);

  async function fetchTeachers() {
    try {
      const response = await userService.getUsers({
        role: "teacher",
        limit: 1000,
      }); // Fetch all teachers
      teachers = response.data.map((t) => ({
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        email: t.email,
      }));
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Error al cargar profesores.");
    }
  }

  $effect(() => {
    fetchTeachers();
  });

  const columns: ColumnDef<TeacherData>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => row.original.name,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) =>
        renderComponent(SelectButtonCell, {
          onClick: () => onSelect(row.original),
        }),
    },
  ];

  const table = createSvelteTable({
    get data() {
      return teachers;
    },
    columns,
    state: {
      get pagination() {
        return pagination;
      },
      get sorting() {
        return sorting;
      },
      get columnFilters() {
        return columnFilters;
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        pagination = updater(pagination);
      } else {
        pagination = updater;
      }
    },
    onSortingChange: (updater) => {
      if (typeof updater === "function") {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
    },
    onColumnFiltersChange: (updater) => {
      if (typeof updater === "function") {
        columnFilters = updater(columnFilters);
      } else {
        columnFilters = updater;
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
</script>

<Dialog.Header>
  <Dialog.Title>Seleccionar Coordinador</Dialog.Title>
  <Dialog.Description>
    Busca y selecciona un profesor de la lista para asignar como coordinador.
  </Dialog.Description>
</Dialog.Header>

<div class="space-y-4 py-4">
  <Input.Input
    placeholder="Filtrar profesores..."
    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
    oninput={(e) =>
      table.getColumn("name")?.setFilterValue(e.currentTarget.value)}
    class="w-full"
  />
  <div class="rounded-md border">
    <ScrollArea class="h-72 w-full">
      <Table.Root>
        <Table.Header>
          {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
            <Table.Row>
              {#each headerGroup.headers as header (header.id)}
                <Table.Head>
                  {#if !header.isPlaceholder}
                    <Button
                      variant="ghost"
                      onclick={() =>
                        header.column.toggleSorting(
                          header.column.getIsSorted() === "asc",
                        )}
                    >
                      <FlexRender
                        content={header.column.columnDef.header}
                        context={header.getContext()}
                      />
                      {#if header.column.getIsSorted() === "asc"}
                        <span> ▲</span>
                      {:else if header.column.getIsSorted() === "desc"}
                        <span> ▼</span>
                      {/if}
                    </Button>
                  {/if}
                </Table.Head>
              {/each}
            </Table.Row>
          {/each}
        </Table.Header>
        <Table.Body>
          {#each table.getRowModel().rows as row (row.id)}
            <Table.Row>
              {#each row.getVisibleCells() as cell (cell.id)}
                <Table.Cell class="truncate">
                  <FlexRender
                    content={cell.column.columnDef.cell}
                    context={cell.getContext()}
                  />
                </Table.Cell>
              {/each}
            </Table.Row>
          {:else}
            <Table.Row>
              <Table.Cell colspan={columns.length} class="h-24 text-center">
                No results.
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </ScrollArea>
  </div>
  <div class="flex items-center justify-end space-x-2 pt-4">
    <Button
      variant="outline"
      size="sm"
      onclick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      Anterior
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
    >
      Siguiente
    </Button>
  </div>
</div>
