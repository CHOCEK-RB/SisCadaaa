<script lang="ts">
  import type { GroupGradesResponse, StudentGradeInfo, UpdateGradeDto } from "$lib/services/groups.service";
  import { invalidateAll } from "$app/navigation";
  import { groupsService } from "$lib/services/groups.service";
  import * as Table from "$lib/components/ui/table";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Loader2, Save, Pencil, X } from "lucide-svelte";
  import { toast } from "svelte-sonner";
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
  import GradeCell from "./GradeCell.svelte"; //
  import { createRawSnippet } from "svelte";

  let { groupGradesData } = $props<{ groupGradesData: GroupGradesResponse }>();

  // --- Estado ---
  let isEditing = $state(false);
  let isSaving = $state(false);
  let sorting = $state<SortingState>([]);
  let columnFilters = $state<ColumnFiltersState>([]);
    $effect(() => {
    localStudents = groupGradesData.students.map(mapStudentToRow);
  });

  // Mapeo inicial de datos (Local state para edición)
  let localStudents = $state(groupGradesData.students.map(mapStudentToRow));
  let backupStudents = $state<any[]>([]); // Backup para cancelar

  function mapStudentToRow(student: StudentGradeInfo) {
    const g = student.grades || {};
    return {
      enrollmentId: student.enrollmentId,
      cui: student.cui,
      fullName: `${student.firstName} ${student.lastName}`,
      // Aseguramos que existan las propiedades
      firstContinue: g.firstContinue ?? null,
      secondContinue: g.secondContinue ?? null,
      thirdContinue: g.thirdContinue ?? null,
      firstPartial: g.firstPartial ?? null,
      secondPartial: g.secondPartial ?? null,
      thirdPartial: g.thirdPartial ?? null,
    };
  }

  // --- Funciones de Acción ---

  function enableEditMode() {
    backupStudents = JSON.parse(JSON.stringify(localStudents)); // Guardar backup
    isEditing = true;
  }

  function cancelEditMode() {
    localStudents = JSON.parse(JSON.stringify(backupStudents)); // Restaurar
    isEditing = false;
  }

  function updateLocalGrade(rowIndex: number, key: string, value: number | null) {
    // Actualizamos el estado local
    localStudents[rowIndex] = {
      ...localStudents[rowIndex],
      [key]: value
    };
  }

  async function handleSaveChanges() {
    isSaving = true;
    try {
      const updates: UpdateGradeDto[] = localStudents.map(student => ({
        enrollmentId: student.enrollmentId,
        grades: {
          firstContinue: student.firstContinue,
          secondContinue: student.secondContinue,
          thirdContinue: student.thirdContinue,
          firstPartial: student.firstPartial,
          secondPartial: student.secondPartial,
          thirdPartial: student.thirdPartial,
        }
      }));

      await groupsService.updateMultipleGrades(groupGradesData.groupId, updates);
      await invalidateAll();
      toast.success("Notas guardadas correctamente");
      isEditing = false;
    } catch (error: any) {
      toast.error("Error al guardar: " + (error.message || "Desconocido"));
    } finally {
      isSaving = false;
    }
  }

  // --- Definición de Columnas (Reactiva con $derived) ---
  // Usamos $derived para que cuando cambie 'isEditing', las columnas se regeneren
  const columns = $derived<ColumnDef<any>[]>([
    {
      accessorKey: "fullName",
      header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: "Estudiante" }),
      cell: ({ row }) => row.original.fullName,
    },
    {
      accessorKey: "cui",
      header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: "CUI" }),
      cell: ({ row }) => row.original.cui,
    },
    // Columnas de Notas usando GradeCell
    ...createGradeColumn("firstContinue", "C1"),
    ...createGradeColumn("secondContinue", "C2"),
    ...createGradeColumn("thirdContinue", "C3"),
    ...createGradeColumn("firstPartial", "P1", true),
    ...createGradeColumn("secondPartial", "P2", true),
    ...createGradeColumn("thirdPartial", "P3", true),
    {
      id: "final",
      header: "Promedio",
      cell: ({ row }) => {
        const s = row.original;
        const p = groupGradesData.gradingScheme;
        const final = (
          (Number(s.firstContinue||0) * (p.firstContinue||0)/100) +
          (Number(s.secondContinue||0) * (p.secondContinue||0)/100) +
          (Number(s.thirdContinue||0) * (p.thirdContinue||0)/100) +
          (Number(s.firstPartial||0) * (p.firstPartial||0)/100) +
          (Number(s.secondPartial||0) * (p.secondPartial||0)/100) +
          (Number(s.thirdPartial||0) * (p.thirdPartial||0)/100)
        ).toFixed(1);
        
        // Renderizamos HTML simple para el promedio ya que es solo lectura
        const colorClass = Number(final) >= 10.5 ? "text-green-600" : "text-red-600";
        return renderSnippet(createRawSnippet(() => ({
            render: () => `<div class="text-center font-bold ${colorClass}">${final}</div>`
        })));
      }
    }
  ]);

  // Helper para crear columnas repetitivas
  function createGradeColumn(key: string, title: string, isPartial = false): ColumnDef<any>[] {
    return [{
      accessorKey: key,
      header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title }),
      cell: ({ row, getValue }) => renderComponent(GradeCell, {
        value: getValue() as number | null,
        isEditing: isEditing, // Pasamos el estado reactivo
        onUpdate: (val) => updateLocalGrade(row.index, key, val)
      }),
      meta: {
        isPartial // Podrías usar esto para estilos si quisieras
      }
    }];
  }

  // --- Configuración de la Tabla ---
  const table = createSvelteTable({
    get data() { return localStudents; },
    get columns() { return columns; }, // Getter para reactividad
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => sorting = typeof updater === "function" ? updater(sorting) : updater,
    onColumnFiltersChange: (updater) => columnFilters = typeof updater === "function" ? updater(columnFilters) : updater,
    state: {
      get sorting() { return sorting; },
      get columnFilters() { return columnFilters; },
    },
  });
</script>

<div class="w-full space-y-4">
  <div class="flex items-center justify-between gap-4 p-1">
    <Input
      placeholder="Filtrar por estudiante..."
      value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
      oninput={(e) => table.getColumn("fullName")?.setFilterValue(e.currentTarget.value)}
      class="max-w-sm"
    />
    
    <div class="flex gap-2">
      {#if !isEditing}
        <Button onclick={enableEditMode} variant="secondary">
          <Pencil class="mr-2 h-4 w-4" />
          Modificar Notas
        </Button>
      {:else}
        <Button onclick={cancelEditMode} variant="ghost" disabled={isSaving}>
          <X class="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button onclick={handleSaveChanges} disabled={isSaving} class="min-w-[140px]">
          {#if isSaving}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          {:else}
            <Save class="mr-2 h-4 w-4" />
            Guardar
          {/if}
        </Button>
      {/if}
    </div>
  </div>

  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head>
                {#if !header.isPlaceholder}
                  <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
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
                  <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
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