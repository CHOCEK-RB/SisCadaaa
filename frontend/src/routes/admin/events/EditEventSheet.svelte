<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { invalidateAll } from "$app/navigation";
  import {
    eventService,
    type GlobalEvent,
    EventType,
  } from "$lib/services/event.service";
  import {
    getLocalTimeZone,
    CalendarDate,
    type DateValue,
    today,
  } from "@internationalized/date";
  import { Calendar } from "$lib/components/ui/calendar";
  import * as Popover from "$lib/components/ui/popover";
  import { Calendar as CalendarIcon } from "lucide-svelte";
  import * as Select from "$lib/components/ui/select";
  import { toast } from "svelte-sonner";
  import { SvelteDate } from "svelte/reactivity";

  let {
    open = $bindable<boolean>(),
    eventData,
    isEventInFuture,
  } = $props<{
    open: boolean;
    eventData: GlobalEvent;
    isEventInFuture: boolean;
  }>();

  let editableEvent = $state<GlobalEvent | null>(null);
  let calendarStartDateValue = $state<CalendarDate | undefined>(undefined);
  let calendarEndDateValue = $state<CalendarDate | undefined>(undefined);
  let popoverStartDateOpen = $state(false);
  let popoverEndDateOpen = $state(false);
  let lastInitializedEventId = $state<string | null>(null);

  const disableIsActive = $derived(() => !isEventInFuture);

  const isStartDateInPast = $derived(() => {
    if (!editableEvent?.startDate) return false;
    const todayDate = today(getLocalTimeZone()).toDate(getLocalTimeZone());
    const eventStartDate = new SvelteDate(editableEvent.startDate);
    eventStartDate.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);
    return eventStartDate < todayDate;
  });

  const typeTranslater = {
    [EventType.ACADEMIC]: "Académico",
    [EventType.GRADING]: "Notas",
    [EventType.LAB_ENROLLMENT]: "Matrícula Laboratorios",
  };

  const selectedEventTypeLabel = $derived(() => {
    if (editableEvent?.type && typeTranslater[editableEvent.type]) {
      return typeTranslater[editableEvent.type];
    }
    return "Seleccionar tipo de evento";
  });

  $effect(() => {
    if (open && eventData && eventData.id !== lastInitializedEventId) {
      editableEvent = { ...eventData };
      if (editableEvent && editableEvent.startDate) {
        editableEvent.startDate = new Date(editableEvent.startDate);
        calendarStartDateValue = new CalendarDate(
          editableEvent.startDate.getFullYear(),
          editableEvent.startDate.getMonth() + 1,
          editableEvent.startDate.getDate(),
        );
      }
      if (editableEvent && editableEvent.endDate) {
        editableEvent.endDate = new Date(editableEvent.endDate);
        calendarEndDateValue = new CalendarDate(
          editableEvent.endDate.getFullYear(),
          editableEvent.endDate.getMonth() + 1,
          editableEvent.endDate.getDate(),
        );
      }

      if (!isEventInFuture && editableEvent && editableEvent.isActive) {
        editableEvent.isActive = false;
      }
      lastInitializedEventId = eventData.id;
    } else if (!open) {
      editableEvent = null;
      calendarStartDateValue = undefined;
      calendarEndDateValue = undefined;
      lastInitializedEventId = null;
    }
  });

  function handleStartDateSelect(value: DateValue | undefined) {
    if (!editableEvent) return;
    if (value instanceof CalendarDate) {
      editableEvent.startDate = value.toDate(getLocalTimeZone());
      calendarStartDateValue = value;
    } else {
      editableEvent.startDate = new Date();
      calendarStartDateValue = undefined;
    }
    popoverStartDateOpen = false;
  }

  function handleEndDateSelect(value: DateValue | undefined) {
    if (!editableEvent) return;
    if (value instanceof CalendarDate) {
      editableEvent.endDate = value.toDate(getLocalTimeZone());
      calendarEndDateValue = value;
    } else {
      editableEvent.endDate = new Date();
      calendarEndDateValue = undefined;
    }
    popoverEndDateOpen = false;
  }

  async function handleSubmit() {
    if (!editableEvent) return;
    try {
      await eventService.updateEvent(editableEvent.id, {
        name: editableEvent.name,
        type: editableEvent.type,
        startDate: editableEvent.startDate,
        endDate: editableEvent.endDate,
        isActive: editableEvent.isActive,
      });
      open = false;
      await invalidateAll();
      toast.success("Event updated successfully!");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event.");
    }
  }
</script>

<Sheet.Root bind:open>
  <Sheet.Content side="right" class="p-4 sm:max-w-md sm:p-6">
    <Sheet.Header>
      <Sheet.Title>Editar Event</Sheet.Title>
      <Sheet.Description>
        Has los cambios deseados en la información del evento.
      </Sheet.Description>
    </Sheet.Header>
    {#if editableEvent}
      {@const event = editableEvent}
      <form onsubmit={handleSubmit} class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="name">Name</Label>
          <Input
            id="name"
            value={event.name}
            oninput={(e) => (event.name = e.currentTarget.value)}
            required
          />
        </div>
        <div class="grid gap-2">
          <Label for="type">Tipo</Label>
          <Select.Root type="single" bind:value={event.type} name="eventType">
            <Select.Trigger class="w-full">
              {selectedEventTypeLabel()}
            </Select.Trigger>
            <Select.Content>
              {#each Object.values(EventType) as type (type)}
                <Select.Item value={type} label={type}>
                  {typeTranslater[type]}
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

        <!-- Start Date Field -->
        <div class="grid gap-2">
          <Label for="startDate">Fecha de Inicio</Label>
          <Popover.Root bind:open={popoverStartDateOpen}>
            <Popover.Trigger>
              {#snippet child({ props })}
                <Button
                  {...props}
                  variant="outline"
                  class="w-32 justify-between font-normal"
                  disabled={isStartDateInPast()}
                >
                  {event.startDate
                    ? event.startDate.toLocaleDateString()
                    : "Select date"}
                  <CalendarIcon />
                </Button>
              {/snippet}
            </Popover.Trigger>
            <Popover.Content class="w-auto p-0">
              <Calendar
                type="single"
                bind:value={calendarStartDateValue}
                onValueChange={(v: DateValue | undefined) =>
                  handleStartDateSelect(v)}
                initialFocus
                captionLayout="dropdown"
              />
            </Popover.Content>
          </Popover.Root>
        </div>

        <div class="grid gap-2">
          <Label for="endDate">Fecha de fin</Label>
          <Popover.Root bind:open={popoverEndDateOpen}>
            <Popover.Trigger>
              {#snippet child({ props })}
                <Button
                  {...props}
                  variant="outline"
                  class="w-32 justify-between font-normal"
                >
                  {event.endDate
                    ? event.endDate.toLocaleDateString()
                    : "Select date"}
                  <CalendarIcon />
                </Button>
              {/snippet}
            </Popover.Trigger>

            <Popover.Content class="w-auto p-0">
              <Calendar
                type="single"
                bind:value={calendarEndDateValue}
                onValueChange={(v: DateValue | undefined) =>
                  handleEndDateSelect(v)}
                initialFocus
                captionLayout="dropdown"
              />
            </Popover.Content>
          </Popover.Root>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox
            id="isActive"
            bind:checked={event.isActive}
            disabled={disableIsActive()}
          />
          <Label for="isActive">Esta activo</Label>
        </div>
        <Sheet.Footer>
          <Button type="submit">Guardar Cambios</Button>
        </Sheet.Footer>
      </form>
    {/if}
  </Sheet.Content>
</Sheet.Root>

