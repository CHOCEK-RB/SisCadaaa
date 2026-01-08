<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Input from "$lib/components/ui/input";
  import { courseService } from "$lib/services/course.service";
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

  let { onSelect } = $props<{
    onSelect: (course: { id: string; name: string; code: string }) => void;
  }>();

  type CourseData = {
    id: string;
    name: string;
    code: string;
  };

  let courses = $state<CourseData[]>([]);

  // Table state
  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
  let sorting = $state<SortingState>([]);
  let columnFilters = $state<ColumnFiltersState>([]);

  async function fetchCourses() {
    try {
      const response = await courseService.searchCourses(""); // Fetch all courses initially
      courses = response.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code || "",
      }));
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Error al cargar cursos.");
    }
  }

  $effect(() => {
    fetchCourses();
  });

  const columns: ColumnDef<CourseData>[] = [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => row.original.code,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => row.original.name,
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
      return courses;
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
  <Dialog.Title>Seleccionar Curso</Dialog.Title>
  <Dialog.Description>
    Busca y selecciona un curso de la lista.
  </Dialog.Description>
</Dialog.Header>

<div class="space-y-4 py-4">
  <Input.Input
    placeholder="Filtrar cursos..."
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
