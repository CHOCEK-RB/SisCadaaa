<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { invalidateAll } from "$app/navigation";
  import {
    eventService,
    type CreateGlobalEventDto,
    EventType,
  } from "$lib/services/event.service";
  import {
    getLocalTimeZone,
    today,
    CalendarDate,
    type DateValue,
  } from "@internationalized/date";
  import { Calendar } from "$lib/components/ui/calendar";
  import * as Popover from "$lib/components/ui/popover";
  import { Calendar as CalendarIcon } from "lucide-svelte";
  import * as Select from "$lib/components/ui/select";
  import { toast } from "svelte-sonner";

  let { open = $bindable<boolean>() } = $props();

  let newEvent = $state<CreateGlobalEventDto>({
    name: "",
    type: EventType.ACADEMIC,
    startDate: new Date(),
    endDate: new Date(),
    isActive: true,
  });

  const typeTranslater = {
    [EventType.ACADEMIC]: "Académico",
    [EventType.GRADING]: "Notas",
    [EventType.LAB_ENROLLMENT]: "Matrícula Laboratorios",
  };

  let calendarStartDateValue = $state<CalendarDate | undefined>(undefined);
  let calendarEndDateValue = $state<CalendarDate | undefined>(undefined);
  let popoverStartDateOpen = $state(false);
  let popoverEndDateOpen = $state(false);

  let isSheetJustOpened = false;

  const selectedEventTypeLabel = $derived(() => {
    if (newEvent?.type && typeTranslater[newEvent.type]) {
      return typeTranslater[newEvent.type];
    }
    return "Seleccionar tipo de evento";
  });

  $effect(() => {
    if (open && !isSheetJustOpened) {
      isSheetJustOpened = true;

      const todayDate = today(getLocalTimeZone()).toDate(getLocalTimeZone());
      const newStartDate = todayDate;
      const newEndDate = todayDate;

      newEvent.name = "";
      newEvent.type = EventType.ACADEMIC;
      newEvent.startDate = newStartDate;
      newEvent.endDate = newEndDate;
      newEvent.isActive = true;

      calendarStartDateValue = new CalendarDate(
        newStartDate.getFullYear(),
        newStartDate.getMonth() + 1,
        newStartDate.getDate(),
      );
      calendarEndDateValue = new CalendarDate(
        newEndDate.getFullYear(),
        newEndDate.getMonth() + 1,
        newEndDate.getDate(),
      );
    } else if (!open) {
      isSheetJustOpened = false;

      calendarStartDateValue = undefined;
      calendarEndDateValue = undefined;
    }
  });

  function handleStartDateSelect(value: DateValue | undefined) {
    if (value instanceof CalendarDate) {
      newEvent.startDate = value.toDate(getLocalTimeZone());
      calendarStartDateValue = value;
    } else {
      newEvent.startDate = new Date();
      calendarStartDateValue = undefined;
    }
    popoverStartDateOpen = false;
  }

  function handleEndDateSelect(value: DateValue | undefined) {
    if (value instanceof CalendarDate) {
      newEvent.endDate = value.toDate(getLocalTimeZone());
      calendarEndDateValue = value;
    } else {
      newEvent.endDate = new Date();
      calendarEndDateValue = undefined;
    }
    popoverEndDateOpen = false;
  }

  async function handleSubmit() {
    try {
      await eventService.createEvent(newEvent);
      open = false;
      await invalidateAll();

      newEvent = {
        name: "",
        type: EventType.ACADEMIC,
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
      };
      calendarStartDateValue = undefined;
      calendarEndDateValue = undefined;
      toast.success("Event created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event.");
    }
  }
</script>

<Sheet.Root bind:open>
  <Sheet.Content side="right" class="p-4 sm:max-w-md sm:p-6">
    <Sheet.Header>
      <Sheet.Title>Create New Event</Sheet.Title>
      <Sheet.Description>
        Fill in the details for the new event.
      </Sheet.Description>
    </Sheet.Header>
    <form onsubmit={handleSubmit} class="grid gap-4 py-4">
      <div class="grid gap-2">
        <Label for="name">Name</Label>
        <Input
          id="name"
          value={newEvent.name}
          oninput={(e) => (newEvent.name = e.currentTarget.value)}
          required
        />
      </div>
      <div class="grid gap-2">
        <Label for="type">Type</Label>
        <Select.Root type="single" bind:value={newEvent.type} name="eventType">
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
        <Label for="startDate">Start Date</Label>
        <Popover.Root bind:open={popoverStartDateOpen}>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button
                {...props}
                variant="outline"
                class="w-32 justify-between font-normal"
              >
                {newEvent.startDate
                  ? newEvent.startDate.toLocaleDateString()
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
              minValue={today(getLocalTimeZone())}
              captionLayout="dropdown"
            />
          </Popover.Content>
        </Popover.Root>
      </div>

      <div class="grid gap-2">
        <Label for="endDate">End Date</Label>
        <Popover.Root bind:open={popoverEndDateOpen}>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button
                {...props}
                variant="outline"
                class="w-32 justify-between font-normal"
              >
                {newEvent.endDate
                  ? newEvent.endDate.toLocaleDateString()
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
              minValue={today(getLocalTimeZone())}
              captionLayout="dropdown"
            />
          </Popover.Content>
        </Popover.Root>
      </div>
      <div class="flex items-center gap-2">
        <Checkbox id="isActive" bind:checked={newEvent.isActive} />
        <Label for="isActive">Is Active</Label>
      </div>
      <Sheet.Footer>
        <Button type="submit">Create Event</Button>
      </Sheet.Footer>
    </form>
  </Sheet.Content>
</Sheet.Root>
