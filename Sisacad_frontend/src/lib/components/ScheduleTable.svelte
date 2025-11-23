<script lang="ts">
  import type { AcademicGroupDTO } from "$lib/types/group.types";
  import * as Table from "$lib/components/ui/table";
  import * as Card from "$lib/components/ui/card";
  import { onMount } from "svelte";
  import { cn } from "$lib/utils";

  let { groups = [], showCourseName = false } = $props<{
    groups: AcademicGroupDTO[];
    showCourseName?: boolean;
  }>();

  let now = $state(new Date());

  onMount(() => {
    const interval = setInterval(() => {
      now = new Date();
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  });

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const dayMap: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
  };

  const jsDayToName = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  const currentDayName = $derived(jsDayToName[now.getDay()]);
  const currentTimeInMinutes = $derived(now.getHours() * 60 + now.getMinutes());

  const timeSlots = [
    { start: "07:00", end: "07:50" },
    { start: "07:50", end: "08:40" },
    { start: "08:50", end: "09:40" },
    { start: "09:40", end: "10:30" },
    { start: "10:40", end: "11:30" },
    { start: "11:30", end: "12:20" },
    { start: "12:20", end: "13:10" },
    { start: "13:10", end: "14:00" },
    { start: "14:00", end: "14:50" },
    { start: "14:50", end: "15:40" },
    { start: "15:50", end: "16:40" },
    { start: "16:40", end: "17:30" },
    { start: "17:40", end: "18:30" },
    { start: "18:30", end: "19:20" },
    { start: "19:20", end: "20:10" },
  ];

  interface ScheduleEvent {
    group: AcademicGroupDTO;
    schedule: any;
  }

  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + (minutes || 0);
  }

  function normalizeTime(time: string): string {
    const parts = time.split(":");
    const hours = parts[0].padStart(2, "0");
    const minutes = (parts[1] || "00").padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const getTypeClass = (type: string) => {
    switch (type?.toLowerCase()) {
      case "theory":
        return "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300";
      case "laboratory":
        return "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300";
      case "practice":
        return "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300";
      default:
        return "bg-secondary";
    }
  };

  function findEventForSlot(
    day: string,
    timeSlot: { start: string; end: string },
  ): ScheduleEvent | null {
    const slotStartMinutes = timeToMinutes(timeSlot.start);

    for (const group of groups) {
      for (const schedule of group.schedule ?? []) {
        const dayName = dayMap[schedule.day.toLowerCase()];
        if (dayName !== day) continue;

        const eventStartMinutes = timeToMinutes(normalizeTime(schedule.start));
        const eventEndMinutes = timeToMinutes(normalizeTime(schedule.end));

        if (
          slotStartMinutes >= eventStartMinutes &&
          slotStartMinutes < eventEndMinutes
        ) {
          return { group, schedule };
        }
      }
    }
    return null;
  }
</script>

<div class="overflow-x-auto rounded-md border">
  <Table.Root class="table-fixed">
    <Table.Header>
      <Table.Row>
        <Table.Head class="sticky left-0 z-10 w-24 bg-background text-center"
          >Hora</Table.Head
        >
        {#each days as day (day)}
          <Table.Head
            class={cn("w-[180px] text-center", {
              "bg-primary/30": day === currentDayName,
            })}>{day}</Table.Head
          >
        {/each}
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each timeSlots as slot (slot.start)}
        {@const isCurrentSlot =
          currentTimeInMinutes >= timeToMinutes(slot.start) &&
          currentTimeInMinutes < timeToMinutes(slot.end)}
        <Table.Row>
          <Table.Cell
            class={cn(
              "sticky left-0 z-10 border-r bg-background p-5 text-center text-xs font-medium text-muted-foreground",
              {
                "bg-primary/10 text-primary-foreground": isCurrentSlot,
              },
            )}
          >
            {slot.start} - {slot.end}
          </Table.Cell>
          {#each days as day (day)}
            {@const event = findEventForSlot(day, slot)}
            {@const isCurrentCell = isCurrentSlot && day === currentDayName}
            {#if event}
              <Table.Cell
                class={cn("w-[180px] p-1", {
                  "ring-2 ring-primary ring-inset": isCurrentCell,
                })}
              >
                <Card.Root class={`${getTypeClass(event.group.type)}`}>
                  <Card.Header>
                    {#if showCourseName}
                      <Card.Title class="min-w-0 break-all"
                        >{event.group.course.course.name}</Card.Title
                      >
                      <Card.Description>
                        {event.group.course.course.code}
                        <p>
                          Grupo: {event.group.name} ({event.group.type})
                        </p>
                        {slot.start} - {slot.end}
                      </Card.Description>
                    {:else}
                      <Card.Title class="min-w-0 break-all"
                        ><p>
                          Grupo: {event.group.name} ({event.group.type})
                        </p></Card.Title
                      >
                      <Card.Description>
                        {slot.start} - {slot.end}
                      </Card.Description>
                    {/if}
                  </Card.Header>
                </Card.Root>
              </Table.Cell>
            {:else}
              <Table.Cell
                class={cn("w-[180px]", {
                  "bg-primary/5": isCurrentCell,
                })}
              />
            {/if}
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
