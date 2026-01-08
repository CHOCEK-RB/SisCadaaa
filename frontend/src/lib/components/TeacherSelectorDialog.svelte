<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Input from "$lib/components/ui/input";
  import { toast } from "svelte-sonner";
  import {
    type ColumnDef,
    getCoreRowModel,
    getFilteredRowModel,
  } from "@tanstack/table-core";
  import {
    FlexRender,
    createSvelteTable,
    renderComponent,
  } from "$lib/components/ui/data-table/index.js";
  import * as Table from "$lib/components/ui/table";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import SelectButtonCell from "$lib/components/SelectButtonCell.svelte";

  import { userService } from "$lib/services/user.service";

  let { onSelect } = $props<{
    onSelect: (teacher: { id: string; name: string; email: string }) => void;
  }>();

  type TeacherData = {
    id: string;
    name: string;
    email: string;
  };

  let teachers = $state<TeacherData[]>([]);
  let isLoadingTeachers = $state(false);
  let searchQuery = $state("");

  async function fetchTeachers(query: string = "") {
    isLoadingTeachers = true;
    try {
      const response = await userService.getUsers({
        role: "teacher",
        limit: 1000,
        searchQuery: query,
      });
      teachers = response.data.map((t) => ({
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        email: t.email,
      }));
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Error al cargar profesores.");
    } finally {
      isLoadingTeachers = false;
    }
  }

  $effect(() => {
    const timeout = setTimeout(() => {
      fetchTeachers(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  });

  const columns: ColumnDef<TeacherData>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => row.original.name,
      enableColumnFilter: true,
    },
    {
      accessorKey: "email",
      header: "Correo Electrónico",
      cell: ({ row }) => row.original.email,
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
      get globalFilter() {
        return searchQuery;
      },
    },
    onGlobalFilterChange: (updater) => {
      if (typeof updater === "function") {
        searchQuery = updater(searchQuery);
      } else {
        searchQuery = updater;
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
</script>

<Dialog.Header>
  <Dialog.Title>Seleccionar Profesor</Dialog.Title>
  <Dialog.Description>
    Busca y selecciona un profesor de la lista.
  </Dialog.Description>
</Dialog.Header>

<div class="space-y-4 py-4">
  <Input.Input
    placeholder="Filtrar profesores..."
    bind:value={searchQuery}
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
          {#if isLoadingTeachers}
            <Table.Row>
              <Table.Cell colspan={columns.length} class="h-24 text-center">
                Cargando profesores...
              </Table.Cell>
            </Table.Row>
          {:else if table.getRowModel().rows.length === 0}
            <Table.Row>
              <Table.Cell colspan={columns.length} class="h-24 text-center">
                No se encontraron profesores.
              </Table.Cell>
            </Table.Row>
          {:else}
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
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>
    </ScrollArea>
  </div>
  <!-- Removed pagination buttons -->
</div>
