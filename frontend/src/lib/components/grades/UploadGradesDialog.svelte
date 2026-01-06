<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import {
    Loader2,
    Upload,
    FileDown,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle2,
  } from "lucide-svelte";
  import {
    groupsService,
    type UpdateGradeDto,
    type GroupGradesResponse,
    type StudentGradeInfo,
  } from "$lib/services/groups.service";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";
  import * as Alert from "$lib/components/ui/alert";

  let { groupGradesData } = $props<{ groupGradesData: GroupGradesResponse }>();

  let open = $state(false);
  let isSaving = $state(false);
  let fileInput: HTMLInputElement | undefined = $state();
  let processedUpdates = $state<UpdateGradeDto[]>([]);
  let summary = $state<{
    total: number;
    valid: number;
    invalid: number;
    errors: string[];
  } | null>(null);

  function downloadTemplate() {
    const headers = ["CUI", "Estudiante", "C1", "C2", "C3", "P1", "P2", "P3"];
    const rows = groupGradesData.students.map((s: StudentGradeInfo) => {
      const g = s.grades || {};
      return [
        s.cui,
        `"${s.firstName} ${s.lastName}"`,
        g.firstContinue ?? "",
        g.secondContinue ?? "",
        g.thirdContinue ?? "",
        g.firstPartial ?? "",
        g.secondPartial ?? "",
        g.thirdPartial ?? "",
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `plantilla_notas_${groupGradesData.courseCode}_${groupGradesData.groupType}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const text = await file.text();
    processCSV(text);
  }

  function processCSV(csvText: string) {
    const lines = csvText.split(/\r?\n/);
    const updates: UpdateGradeDto[] = [];
    const errors: string[] = [];
    let validCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts =
        line
          .match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
          ?.map((s) => s.replace(/^"|"$/g, "").trim()) || line.split(",");

      if (parts.length < 8) {
        if (line.split(",").length < 3) continue;
      }
      const columns = line.split(",").map((c) => c.trim());
      const cui = columns[0];
      const student = groupGradesData.students.find(
        (s: StudentGradeInfo) => s.cui === cui,
      );

      if (!student) {
        errors.push(`Fila ${i + 1}: CUI ${cui} no encontrado en este grupo.`);
        continue;
      }
      const parseGrade = (val: string): number | undefined => {
        if (!val || val.trim() === "") return undefined;
        const num = Number(val);
        if (isNaN(num) || num < 0 || num > 20) {
          throw new Error(`Nota inválida (${val})`);
        }
        return num;
      };

      try {
        const grades = {
          firstContinue: parseGrade(columns[2]),
          secondContinue: parseGrade(columns[3]),
          thirdContinue: parseGrade(columns[4]),
          firstPartial: parseGrade(columns[5]),
          secondPartial: parseGrade(columns[6]),
          thirdPartial: parseGrade(columns[7]),
        };

        updates.push({
          enrollmentId: student.enrollmentId,
          grades,
        });
        validCount++;
      } catch (err) {
        errors.push(`Fila ${i + 1} (${cui}): ${(err as Error).message}`);
      }
    }

    processedUpdates = updates;
    summary = {
      total: lines.length - 1,
      valid: validCount,
      invalid: errors.length,
      errors: errors.slice(0, 5),
    };
  }

  async function handleSave() {
    if (processedUpdates.length === 0) return;

    isSaving = true;
    try {
      await groupsService.updateMultipleGrades(
        groupGradesData.groupId,
        processedUpdates,
      );
      await invalidateAll();
      toast.success(
        `${processedUpdates.length} estudiantes actualizados correctamente`,
      );
      open = false;

      processedUpdates = [];
      summary = null;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      toast.error("Error al guardar: " + (error.message || "Desconocido"));
    } finally {
      isSaving = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger
    class={buttonVariants({ variant: "outline", class: "gap-2" })}
  >
    <FileSpreadsheet class="h-4 w-4" />
    Importar CSV
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-[600px]">
    <Dialog.Header>
      <Dialog.Title>Importar Notas desde CSV</Dialog.Title>
      <Dialog.Description>
        Descarga la plantilla, rellena las notas y sube el archivo para
        actualizar masivamente.
      </Dialog.Description>
    </Dialog.Header>

    <div class="grid gap-6 py-4">
      <!-- Paso 1: Descargar Plantilla -->
      <div class="rounded-lg border bg-muted/50 p-4">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <h4 class="text-sm font-medium">1. Obtener Plantilla</h4>
            <p class="text-xs text-muted-foreground">
              CSV pre-rellenado con los estudiantes del grupo.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onclick={downloadTemplate}
            class="gap-2"
          >
            <FileDown class="h-4 w-4" />
            Descargar
          </Button>
        </div>
      </div>

      <div class="space-y-2">
        <Label for="file">2. Subir Archivo Completado</Label>
        <div class="flex items-center gap-2">
          <Input
            id="file"
            type="file"
            accept=".csv"
            onchange={handleFileChange}
          />
        </div>
        <p class="text-xs text-muted-foreground">
          Asegúrate de mantener el formato de columnas y los CUIs intactos.
          Rangos válidos: 0-20.
        </p>
      </div>

      {#if summary}
        <div class="space-y-3">
          <h4 class="text-sm font-medium">Resumen de Importación</h4>

          <div class="grid grid-cols-3 gap-4">
            <div class="rounded border p-2 text-center">
              <div class="text-2xl font-bold">{summary.total}</div>
              <div class="text-xs text-muted-foreground">Filas Leídas</div>
            </div>
            <div
              class="rounded border border-green-200 bg-green-50 p-2 text-center dark:border-green-900 dark:bg-green-900/20"
            >
              <div
                class="text-2xl font-bold text-green-600 dark:text-green-400"
              >
                {summary.valid}
              </div>
              <div class="text-xs text-green-600/80 dark:text-green-400/80">
                Válidos
              </div>
            </div>
            <div
              class="rounded border border-red-200 bg-red-50 p-2 text-center dark:border-red-900 dark:bg-red-900/20"
            >
              <div class="text-2xl font-bold text-red-600 dark:text-red-400">
                {summary.invalid}
              </div>
              <div class="text-xs text-red-600/80 dark:text-red-400/80">
                Errores
              </div>
            </div>
          </div>

          {#if summary.errors.length > 0}
            <Alert.Root variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <Alert.Title
                >Errores encontrados (se omitirán estas filas)</Alert.Title
              >
              <Alert.Description class="mt-2 text-xs">
                <ul class="list-inside list-disc">
                  {#each summary.errors as error (error)}
                    <li>{error}</li>
                  {/each}
                  {#if summary.invalid > 5}
                    <li>... y {summary.invalid - 5} errores más.</li>
                  {/if}
                </ul>
              </Alert.Description>
            </Alert.Root>
          {/if}

          {#if summary.valid > 0 && summary.invalid === 0}
            <Alert.Root
              variant="default"
              class="border-green-500 text-green-700 dark:text-green-400"
            >
              <CheckCircle2
                class="h-4 w-4 text-green-600 dark:text-green-400"
              />
              <Alert.Title>Todo correcto</Alert.Title>
              <Alert.Description>
                El archivo está listo para procesarse.
              </Alert.Description>
            </Alert.Root>
          {/if}
        </div>
      {/if}
    </div>

    <Dialog.Footer>
      <Button
        variant="outline"
        onclick={() => (open = false)}
        disabled={isSaving}>Cancelar</Button
      >
      <Button
        onclick={handleSave}
        disabled={isSaving || !summary || summary.valid === 0}
      >
        {#if isSaving}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {:else}
          <Upload class="mr-2 h-4 w-4" />
        {/if}
        Procesar Notas
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
