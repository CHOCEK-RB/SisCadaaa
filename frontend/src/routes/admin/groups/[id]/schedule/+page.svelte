<script lang="ts">
  import type { PageData } from "./$types";
  import ScheduleTable from "$lib/components/ScheduleTable.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Plus, Trash2 } from "lucide-svelte";
  import { groupsService } from "$lib/services/groups.service";
  import { toast } from "svelte-sonner";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Card from "$lib/components/ui/card";
  import { invalidateAll } from "$app/navigation";
  import { getDayName } from "$lib/utils"; // Import the new helper

  let { data } = $props<{ data: PageData }>();

  const groupSchedules = $derived(data.groupSchedules ?? []);
  const currentGroup = $derived(
    groupSchedules.length > 0 ? groupSchedules[0] : null,
  );
  const allScheduleSlots = $derived(currentGroup?.schedule || []);

  let scheduleToDeleteId = $state<string | null>(null);
  let showConfirmDeleteDialog = $state(false);

  function handleDelete(scheduleId: string) {
    scheduleToDeleteId = scheduleId;
    showConfirmDeleteDialog = true;
  }

  async function confirmDelete() {
    if (!scheduleToDeleteId || !currentGroup?.id) {
      toast.error("Error: Información de horario o grupo no encontrada.");
      return;
    }

    try {
      await groupsService.deleteScheduleSlot(
        scheduleToDeleteId,
        currentGroup.id,
      );
      toast.success("Horario eliminado exitosamente.");
      showConfirmDeleteDialog = false;
      scheduleToDeleteId = null;
      await invalidateAll(); // Refresh page data
    } catch (error: any) {
      console.error("Error al eliminar el horario:", error);
      toast.error(error.message || "Error al eliminar el horario.");
    }
  }
</script>

<svelte:head>
  <title>Horario del Grupo - Sisacad</title>
</svelte:head>

<div class="container mx-auto p-4 md:p-8">
  <div class="mb-6 flex items-center justify-between">
    <h2 class="text-3xl font-bold">
      Horario para Grupo {currentGroup?.name || data.groupId}
    </h2>
    <Button
      href={`/admin/groups/${data.groupInfo.id}/schedule/create`}
      size="sm"
    >
      <Plus class="mr-2 h-4 w-4" />
      Crear Horario
    </Button>
  </div>

  <div class="space-y-6">
    {#if groupSchedules.length > 0}
      <h3 class="mb-4 text-xl font-semibold">Vista en Tabla</h3>
      <ScheduleTable groups={groupSchedules} />

      <h3 class="mt-8 mb-4 text-xl font-semibold">Horarios Individuales</h3>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each allScheduleSlots as slot (slot.id)}
          <Card.Root>
            <Card.Header>
              <Card.Title class="flex items-center justify-between">
                <span>{getDayName(slot.day)}</span>
                <Button
                  variant="destructive"
                  size="icon"
                  onclick={() => handleDelete(slot.id)}
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </Card.Title>
              <Card.Description>
                <p>{slot.start} - {slot.end}</p>
                <p>Aula: {slot.classroom.name} ({slot.classroom.type})</p>
              </Card.Description>
            </Card.Header>
          </Card.Root>
        {/each}
      </div>
    {:else}
      <p class="text-muted-foreground">
        No hay horario definido para este grupo.
      </p>
    {/if}
  </div>
</div>

<Dialog.Root bind:open={showConfirmDeleteDialog}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Confirmar Eliminación</Dialog.Title>
      <Dialog.Description>
        ¿Estás seguro de que quieres eliminar este horario? Esta acción no se
        puede deshacer.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button
        variant="outline"
        onclick={() => (showConfirmDeleteDialog = false)}>Cancelar</Button
      >
      <Button variant="destructive" onclick={confirmDelete}>Eliminar</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
