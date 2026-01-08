<script lang="ts">
  import { MoreHorizontal } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { type GlobalEvent, EventType } from "$lib/services/event.service"; // Import EventType
  import { getLocalTimeZone, today } from "@internationalized/date";
  import EditEventSheet from "./EditEventSheet.svelte";
  import DeleteEventDialog from "./DeleteEventDialog.svelte";
  import * as Card from "$lib/components/ui/card";

  let { event } = $props<{ event: GlobalEvent }>();

  let showEditSheet = $state(false);
  let showDeleteDialog = $state(false);

  const isEventInFuture = $derived(() => {
    const todayDate = today(getLocalTimeZone()).toDate(getLocalTimeZone());
    const eventEndDate = new Date(event.endDate);
    return eventEndDate >= todayDate;
  });

  const typeTranslater = {
    [EventType.ACADEMIC]: "Académico",
    [EventType.GRADING]: "Notas",
    [EventType.LAB_ENROLLMENT]: "Matrícula Laboratorios",
  };
</script>

<Card.Root class="mb-4 w-full">
  <Card.Header
    class="flex flex-row items-center justify-between space-y-0 pb-2"
  >
    <Card.Title class="text-xl font-bold text-foreground"
      >{event.name}</Card.Title
    >
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="ghost"
            size="icon"
            class="relative size-8 p-0"
          >
            <span class="sr-only">Abrir opciones</span>
            <MoreHorizontal class="h-4 w-4" />
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Label>Actions</DropdownMenu.Label>
        <DropdownMenu.Item onmousedown={() => (showEditSheet = true)}>
          Editar Evento
        </DropdownMenu.Item>
        <DropdownMenu.Item onmousedown={() => (showDeleteDialog = true)}>
          Eliminar Evento
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Card.Header>
  <Card.Content class="space-y-2">
    <p class="text-muted-foreground">Tipo: {typeTranslater[event.type]}</p>
    <p class="text-muted-foreground">
      De: {new Date(event.startDate).toLocaleDateString()}
      Hasta: {new Date(event.endDate).toLocaleDateString()}
    </p>
    <p class="text-muted-foreground">
      Estado:
      {#if event.isActive && isEventInFuture()}
        <span class="font-semibold text-green-600">Activo</span>
      {:else if event.isActive && !isEventInFuture()}
        <span class="font-semibold text-yellow-600">Pasado</span>
      {:else}
        <span class="font-semibold text-red-600">Inactivo</span>
      {/if}
    </p>
  </Card.Content>
</Card.Root>

<EditEventSheet
  bind:open={showEditSheet}
  eventData={event}
  isEventInFuture={isEventInFuture()}
/>
<DeleteEventDialog
  bind:open={showDeleteDialog}
  eventId={event.id}
  eventName={event.name}
/>
