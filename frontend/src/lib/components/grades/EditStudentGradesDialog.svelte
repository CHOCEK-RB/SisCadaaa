<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Loader2, Pencil } from "lucide-svelte";
  import {
    groupsService,
    type UpdateGradeDto,
  } from "$lib/services/groups.service";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";

  let { student, groupId } = $props<{
    student: any;
    groupId: string;
  }>();

  let open = $state(false);
  let isSaving = $state(false);

  let formData = $state({
    firstContinue: student.firstContinue,
    secondContinue: student.secondContinue,
    thirdContinue: student.thirdContinue,
    firstPartial: student.firstPartial,
    secondPartial: student.secondPartial,
    thirdPartial: student.thirdPartial,
  });

  $effect(() => {
    if (open) {
      formData = {
        firstContinue: student.firstContinue,
        secondContinue: student.secondContinue,
        thirdContinue: student.thirdContinue,
        firstPartial: student.firstPartial,
        secondPartial: student.secondPartial,
        thirdPartial: student.thirdPartial,
      };
    }
  });

  async function handleSave() {
    isSaving = true;
    try {
      const toNumberOrUndefined = (val: any): number | undefined => {
        if (val === "" || val === null || val === undefined) return undefined;
        return Number(val);
      };

      const updates: UpdateGradeDto[] = [
        {
          enrollmentId: student.enrollmentId,
          grades: {
            firstContinue: toNumberOrUndefined(formData.firstContinue),
            secondContinue: toNumberOrUndefined(formData.secondContinue),
            thirdContinue: toNumberOrUndefined(formData.thirdContinue),
            firstPartial: toNumberOrUndefined(formData.firstPartial),
            secondPartial: toNumberOrUndefined(formData.secondPartial),
            thirdPartial: toNumberOrUndefined(formData.thirdPartial),
          },
        },
      ];

      await groupsService.updateMultipleGrades(groupId, updates);
      await invalidateAll();
      toast.success(`Notas de ${student.fullName} actualizadas`);
      open = false;
    } catch (error: any) {
      console.error(error);
      toast.error("Error al guardar: " + (error.message || "Desconocido"));
    } finally {
      isSaving = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger class={buttonVariants({ variant: "ghost", size: "icon" })}>
    <Pencil class="h-4 w-4" />
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-[500px]">
    <Dialog.Header>
      <Dialog.Title>Editar Notas</Dialog.Title>
      <Dialog.Description>
        Modificando calificaciones para <span class="font-bold text-primary"
          >{student.fullName}</span
        >.
      </Dialog.Description>
    </Dialog.Header>

    <div class="grid gap-6 py-4">
      <!-- Sección Continuas -->
      <fieldset class="grid gap-4 rounded-lg border p-4">
        <legend class="-ml-1 px-1 text-sm font-medium"
          >Evaluación Continua</legend
        >
        <div class="grid grid-cols-3 gap-4">
          <div class="grid gap-2">
            <Label for="c1">C1</Label>
            <Input
              id="c1"
              type="number"
              min="0"
              max="20"
              bind:value={formData.firstContinue}
            />
          </div>
          <div class="grid gap-2">
            <Label for="c2">C2</Label>
            <Input
              id="c2"
              type="number"
              min="0"
              max="20"
              bind:value={formData.secondContinue}
            />
          </div>
          <div class="grid gap-2">
            <Label for="c3">C3</Label>
            <Input
              id="c3"
              type="number"
              min="0"
              max="20"
              bind:value={formData.thirdContinue}
            />
          </div>
        </div>
      </fieldset>

      <!-- Sección Parciales -->
      <fieldset class="grid gap-4 rounded-lg border p-4">
        <legend class="-ml-1 px-1 text-sm font-medium"
          >Exámenes Parciales</legend
        >
        <div class="grid grid-cols-3 gap-4">
          <div class="grid gap-2">
            <Label for="p1">P1</Label>
            <Input
              id="p1"
              type="number"
              min="0"
              max="20"
              bind:value={formData.firstPartial}
            />
          </div>
          <div class="grid gap-2">
            <Label for="p2">P2</Label>
            <Input
              id="p2"
              type="number"
              min="0"
              max="20"
              bind:value={formData.secondPartial}
            />
          </div>
          <div class="grid gap-2">
            <Label for="p3">P3</Label>
            <Input
              id="p3"
              type="number"
              min="0"
              max="20"
              bind:value={formData.thirdPartial}
            />
          </div>
        </div>
      </fieldset>
    </div>

    <Dialog.Footer>
      <Button
        variant="outline"
        onclick={() => (open = false)}
        disabled={isSaving}>Cancelar</Button
      >
      <Button onclick={handleSave} disabled={isSaving}>
        {#if isSaving}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        Guardar Cambios
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
