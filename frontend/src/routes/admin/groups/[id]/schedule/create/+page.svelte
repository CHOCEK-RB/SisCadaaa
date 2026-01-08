<script lang="ts">
  import { ChevronLeft } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Select from "$lib/components/ui/select";
  import * as Label from "$lib/components/ui/label";
  import type { Classroom } from "$lib/types/classroom.types";
  import type { PageData } from "./$types";
  import { toast } from "svelte-sonner";
  import * as Table from "$lib/components/ui/table";
  import * as Card from "$lib/components/ui/card";
  import { cn } from "$lib/utils";
  import { SvelteMap } from "svelte/reactivity";
  import { groupsService } from "$lib/services/groups.service";
  import { goto } from "$app/navigation";
  import { classroomService } from "$lib/services/classroom.service";
  import type { ClassroomSchedule } from "$lib/types/classroom.types";

  let { data }: { data: PageData } = $props();
  const groupId = data.groupId;
  let classrooms: Classroom[] = data.classrooms;

  let selectedClassroomId = $state<string | undefined>();
  let isLoadingClassroomSchedule = $state(false);
  let classroomScheduleData = $state<ClassroomSchedule | null>(null);
  let occupiedSlots: { day: string; startTime: string; endTime: string }[] =
    $state([]);

  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const dayMap: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
  };
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

  const dayNameMapping: Record<string, string> = {
    Lunes: "monday",
    Martes: "tuesday",
    Miércoles: "wednesday",
    Jueves: "thursday",
    Viernes: "friday",
  };

  let selectedSlots = $state<Map<string, number[]>>(new Map());

  let selectedDay = $state<string | null>(null);

  function toggleSlot(day: string, clickedSlotIndex: number) {
    const getContiguousBlocks = (indices: number[]) => {
      const blocks: number[][] = [];
      if (indices.length === 0) return blocks;

      let currentBlock = [indices[0]];
      for (let i = 1; i < indices.length; i++) {
        if (indices[i] === indices[i - 1] + 1) {
          currentBlock.push(indices[i]);
        } else {
          blocks.push(currentBlock);
          currentBlock = [indices[i]];
        }
      }
      blocks.push(currentBlock);
      return blocks;
    };

    if (selectedDay !== null && day !== selectedDay) {
      selectedSlots.clear();
      selectedDay = null;
    }

    const currentDaySlots = selectedSlots.get(day) || [];
    let newDaySlots = [...currentDaySlots];
    newDaySlots.sort((a, b) => a - b);

    const isClickedSelected = newDaySlots.includes(clickedSlotIndex);

    if (isClickedSelected) {
      const blocks = getContiguousBlocks(newDaySlots);
      let newFilteredSlots: number[] = [];

      for (const block of blocks) {
        if (block.includes(clickedSlotIndex)) {
        } else {
          newFilteredSlots.push(...block);
        }
      }
      newDaySlots = newFilteredSlots;
    } else {
      newDaySlots.push(clickedSlotIndex);
      newDaySlots.sort((a, b) => a - b);

      const blocksAfterAdd = getContiguousBlocks(newDaySlots);

      if (blocksAfterAdd.length > 1) {
        const minIndex = blocksAfterAdd[0][0];
        const maxIndex =
          blocksAfterAdd[blocksAfterAdd.length - 1][
            blocksAfterAdd[blocksAfterAdd.length - 1].length - 1
          ];
        newDaySlots = Array.from(
          { length: maxIndex - minIndex + 1 },
          (_, i) => minIndex + i,
        );
      }
    }

    const newSelectedSlots = new SvelteMap(selectedSlots);
    if (newDaySlots.length === 0) {
      newSelectedSlots.delete(day);
      selectedDay = null;
    } else {
      newSelectedSlots.set(day, newDaySlots);
      selectedDay = day;
    }
    selectedSlots = newSelectedSlots;
  }

  // Helper function to convert HH:MM string to minutes since midnight
  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + (minutes || 0);
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (!selectedClassroomId) {
      toast.error("Por favor, selecciona un aula.");
      return;
    }
    if (selectedSlots.size === 0) {
      toast.error("Por favor, selecciona al menos un bloque de horario.");
      return;
    }

    const scheduleData = Array.from(selectedSlots.entries()).map(
      ([dayName, slotIndices]) => {
        const minSlotIndex = Math.min(...slotIndices);
        const maxSlotIndex = Math.max(...slotIndices);

        const startTime = timeSlots[minSlotIndex].start;
        const endTime = timeSlots[maxSlotIndex].end;

        return {
          day: dayNameMapping[dayName],
          startTime: startTime,
          endTime: endTime,
        };
      },
    );

    console.log("Form data submitted:", {
      groupId,
      classroomId: selectedClassroomId,
      scheduleSlots: scheduleData,
    });

    try {
      await groupsService.createSchedule({
        groupId,
        classroomId: selectedClassroomId,
        scheduleSlots: scheduleData,
      });
      toast.success("Horario guardado exitosamente.");
      goto(`/admin/groups/${groupId}/schedule`);
    } catch (error) {
      console.error("Error al guardar el horario:", error);
      if (error && typeof error === "object" && "message" in error) {
        toast.error(error.message as string);
      } else {
        toast.error("Error al guardar el horario.");
      }
    }
  }

  $effect(() => {
    if (classrooms.length > 0 && !selectedClassroomId) {
      selectedClassroomId = classrooms[0].id;
    }
  });

  $effect(() => {
    async function fetchClassroomSchedule() {
      if (!selectedClassroomId) {
        classroomScheduleData = null;
        occupiedSlots = [];
        return;
      }
      isLoadingClassroomSchedule = true;
      try {
        const schedule =
          await classroomService.getScheduleForClassroom(selectedClassroomId);
        classroomScheduleData = schedule;

        occupiedSlots = (schedule?.academicGroups || []).flatMap((group) =>
          (group.schedule || []).map((slot) => ({
            day: dayMap[slot.day.toLowerCase()],
            startTime: slot.start,
            endTime: slot.end,
          })),
        );

        selectedSlots.clear();
      } catch (error) {
        console.error("Error fetching classroom schedule:", error);
        toast.error("Error al cargar el horario del aula.");
      } finally {
        isLoadingClassroomSchedule = false;
      }
    }
    fetchClassroomSchedule();
  });
</script>

<svelte:head>
  <title>Crear Horario - Sisacad</title>
</svelte:head>

<div class="container mx-auto p-4 md:p-8">
  <div class="mb-6 flex items-center gap-4">
    <Button
      href="/admin/groups/{groupId}/schedule"
      variant="outline"
      size="icon"
    >
      <ChevronLeft class="h-4 w-4" />
    </Button>
    <h1 class="text-3xl font-bold">Crear Horario para Grupo {groupId}</h1>
  </div>

  <div class="space-y-4">
    <div class="space-y-2">
      <Label.Label for="classroom-select">Seleccionar Aula</Label.Label>
      <Select.Root
        type="single"
        bind:value={selectedClassroomId}
        disabled={classrooms.length === 0}
      >
        <Select.Trigger class="w-[280px]">
          {#if classrooms.length === 0}
            No hay aulas disponibles
          {:else}
            {classrooms.find((c) => c.id === selectedClassroomId)?.name ||
              "Selecciona un aula"}
          {/if}
        </Select.Trigger>
        <Select.Content>
          {#each classrooms as classroom (classroom.id)}
            <Select.Item value={classroom.id}>
              {classroom.name} ({classroom.type})
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>

    <p class="mb-4 text-muted-foreground">
      Selecciona los días y horas para el horario del grupo.
    </p>

    <form onsubmit={(e) => handleSubmit(e)}>
      <div class="overflow-x-auto rounded-md border-3 border-double">
        <Table.Root class="table-fixed ">
          <Table.Header>
            <Table.Row>
              <Table.Head
                class="sticky left-0 z-10 w-24 bg-background text-center"
                >Hora</Table.Head
              >
              {#each daysOfWeek as day (day)}
                <Table.Head class="w-[180px] text-center">{day}</Table.Head>
              {/each}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each timeSlots as slot, slotIndex (slotIndex)}
              <Table.Row class="border-3">
                <Table.Cell
                  class="sticky left-0 z-10 border-r bg-background p-5 text-center text-xs font-medium text-muted-foreground"
                >
                  {slot.start} - {slot.end}
                </Table.Cell>
                {#each daysOfWeek as day (day + slotIndex)}
                  {@const isSelected = selectedSlots
                    .get(day)
                    ?.includes(slotIndex)}
                  {@const currentSlotStartMinutes = timeToMinutes(slot.start)}
                  {@const currentSlotEndMinutes = timeToMinutes(slot.end)}
                  {@const isOccupied = occupiedSlots.some((occupied) => {
                    if (occupied.day !== day) return false;
                    const occupiedStartMinutes = timeToMinutes(
                      occupied.startTime,
                    );
                    const occupiedEndMinutes = timeToMinutes(occupied.endTime);
                    return (
                      currentSlotStartMinutes < occupiedEndMinutes &&
                      occupiedStartMinutes < currentSlotEndMinutes
                    );
                  })}
                  <Table.Cell
                    class={cn("w-[180px] cursor-pointer p-1", {
                      "pointer-events-none": isOccupied,
                      "bg-primary/20 text-primary-foreground": isSelected,
                    })}
                    onclick={() => {
                      if (!isOccupied) toggleSlot(day, slotIndex);
                      else toast.info("Este horario ya está ocupado.");
                    }}
                  >
                    {#if isOccupied}
                      <Card.Root
                        class="flex h-full  justify-center border-gray-300 bg-chart-2/20"
                      >
                        <Card.Header class="p-2">
                          <Card.Title class="text-lg">Ocupado</Card.Title>
                          <Card.Description class="text-sm">
                            {slot.start} - {slot.end}
                          </Card.Description>
                        </Card.Header>
                      </Card.Root>
                    {:else if isSelected}
                      <Card.Root
                        class="flex h-full  justify-center border-gray-300 bg-chart-1/20"
                      >
                        <Card.Header class="p-2">
                          <Card.Title class="text-lg">Seleccionado</Card.Title>
                          <Card.Description class="text-sm">
                            {slot.start} - {slot.end}
                          </Card.Description>
                        </Card.Header>
                      </Card.Root>
                    {/if}
                  </Table.Cell>
                {/each}
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>

      <div class="mt-4 flex justify-end">
        <Button
          type="submit"
          disabled={!selectedClassroomId || selectedSlots.size === 0}
        >
          Guardar Horario
        </Button>
      </div>
    </form>
  </div>
</div>
