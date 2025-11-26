<script lang="ts">
  import type { PageData } from "./$types";
  import { timeSlots } from "./schema";
  import { toast } from "svelte-sonner";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import {
    getLocalTimeZone,
    today,
    CalendarDate,
  } from "@internationalized/date";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import ScheduleTable from "$lib/components/ScheduleTable.svelte";
  import { reservationService } from "$lib/services/reservation.service";
  import { goto } from "$app/navigation";
  import { z } from "zod";

  let { data } = $props<{ data: PageData }>();

  let selectedDate: Date = $state(new Date());
  let selectedStartTime: string = $state(timeSlots[0]);
  let selectedEndTime: string = $state(timeSlots[1]);

  let popoverOpen = $state(false);

  const calendarDateValue = $derived.by(() => {
    if (!selectedDate) return undefined;
    try {
      return new CalendarDate(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        selectedDate.getDate(),
      );
    } catch {
      return undefined;
    }
  });

  const localReservationSchema = z
    .object({
      date: z.date({ message: "Por favor, seleccione una fecha." }),
      startTime: z.string({
        message: "Por favor, seleccione una hora de inicio.",
      }),
      endTime: z.string({
        message: "Por favor, seleccione una hora de fin.",
      }),
    })
    .refine(
      (data) => {
        if (!data.startTime || !data.endTime) return true;
        return data.startTime < data.endTime;
      },
      {
        message: "La hora de fin debe ser posterior a la hora de inicio.",
        path: ["endTime"],
      },
    );

  let formErrors: z.ZodIssue[] = $state([]);
  let submitting: boolean = $state(false);

  async function handleSubmit() {
    formErrors = [];
    submitting = true;
    const loadingToastId = toast.loading("Realizando reserva...");

    const formData = {
      date: selectedDate,
      startTime: selectedStartTime,
      endTime: selectedEndTime,
    };

    const parsed = localReservationSchema.safeParse(formData);

    if (!parsed.success) {
      formErrors = parsed.error.issues;
      toast.dismiss(loadingToastId);
      toast.error("Por favor, corrija los errores del formulario.");
      submitting = false;
      return;
    }

    try {
      const classroomId = data.classroomId;
      if (!classroomId) {
        toast.dismiss(loadingToastId);
        toast.error("ID de aula no disponible.");
        submitting = false;
        return;
      }

      const baseDate = parsed.data.date;
      const [startHours, startMinutes] = parsed.data.startTime
        .split(":")
        .map(Number);
      const startDateTime = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        startHours,
        startMinutes,
        0,
        0,
      );

      const [endHours, endMinutes] = parsed.data.endTime.split(":").map(Number);
      const endDateTime = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        endHours,
        endMinutes,
        0,
        0,
      );

      await reservationService.createReservation(
        {
          classroomId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        },
        {},
      );

      toast.dismiss(loadingToastId);
      toast.success("Reserva creada exitosamente");
      setTimeout(async () => {
        await goto("/teacher/schedule");
      }, 3000);
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      console.error("Error creating reservation:", error);
      let errorMessage = "Error desconocido al crear la reserva.";
      if (error && typeof error === "object" && "message" in error) {
        errorMessage = error.message;
        if (error.data && error.data.message) {
          errorMessage = error.data.message;
        }
      }
      toast.error(errorMessage);
    } finally {
      submitting = false;
    }
  }
</script>

<h1 class="mb-2 text-3xl font-bold tracking-tight">
  Reserva para el Salón: {data.classroom?.name}
</h1>
<p class="mb-6 text-muted-foreground">
  Complete el formulario para crear una nueva reserva y consulte el horario
  actual del salón.
</p>

<div class="grid grid-cols-1 gap-8">
  <div>
    <h2 class="mb-4 text-xl font-bold">Crear Nueva Reserva</h2>
    <form onsubmit={handleSubmit} class="space-y-4">
      {#if formErrors.length > 0}
        <div class="rounded-md bg-red-100 p-3 font-medium text-red-600">
          <p>Se encontraron los siguientes errores:</p>
          <ul>
            {#each formErrors as error (error.path.join("."))}
              <li>{error.path.join(".")}: {error.message}</li>
            {/each}
          </ul>
        </div>
      {/if}

      <div class="flex flex-wrap items-end gap-4">
        <div class="min-w-[200px] flex-1">
          <label
            class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            for="date">Fecha</label
          >
          <Popover.Root bind:open={popoverOpen}>
            <Popover.Trigger>
              <Button
                variant="outline"
                class="w-full justify-between font-normal"
                disabled={submitting}
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {calendarDateValue
                  ? calendarDateValue
                      .toDate(getLocalTimeZone())
                      .toLocaleDateString()
                  : "Seleccionar Fecha"}
              </Button>
            </Popover.Trigger>
            <Popover.Content class="w-auto overflow-hidden p-0" align="start">
              <Calendar
                type="single"
                value={calendarDateValue}
                onValueChange={(v) => {
                  if (v) {
                    selectedDate = v.toDate(getLocalTimeZone());
                  } else {
                    selectedDate = new Date();
                  }
                  popoverOpen = false;
                }}
                minValue={today(getLocalTimeZone())}
                captionLayout="dropdown"
              />
            </Popover.Content>
          </Popover.Root>
          {#if formErrors.some((e) => e.path[0] === "date")}
            <p class="mt-1 text-sm font-medium text-red-500">
              {formErrors.find((e) => e.path[0] === "date")?.message}
            </p>
          {/if}
        </div>

        <div class="min-w-[150px] flex-1">
          <label
            class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            for="startTime">Hora de Inicio</label
          >
          <Select.Root
            type="single"
            bind:value={selectedStartTime}
            name="startTime"
            disabled={submitting}
          >
            <Select.Trigger>
              {selectedStartTime || "Inicio"}
            </Select.Trigger>
            <Select.Content>
              {#each timeSlots as slot (slot)}
                <Select.Item value={slot}>{slot}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
          {#if formErrors.some((e) => e.path[0] === "startTime")}
            <p class="mt-1 text-sm font-medium text-red-500">
              {formErrors.find((e) => e.path[0] === "startTime")?.message}
            </p>
          {/if}
        </div>

        <div class="min-w-[150px] flex-1">
          <label
            class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            for="endTime">Hora de Fin</label
          >
          <Select.Root
            type="single"
            bind:value={selectedEndTime}
            name="endTime"
            disabled={submitting}
          >
            <Select.Trigger>
              {selectedEndTime || "Fin"}
            </Select.Trigger>
            <Select.Content>
              {#each timeSlots as slot (slot)}
                <Select.Item value={slot}>{slot}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
          {#if formErrors.some((e) => e.path[0] === "endTime")}
            <p class="mt-1 text-sm font-medium text-red-500">
              {formErrors.find((e) => e.path[0] === "endTime")?.message}
            </p>
          {/if}
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Reservando..." : "Reservar"}
        </Button>
      </div>
    </form>
  </div>

  <div>
    <h2 class="mb-4 text-xl font-bold">Horario del Salón</h2>
    <ScheduleTable
      groups={data.schedule?.academicGroups || []}
      reservations={data.schedule?.reservations || []}
    />
  </div>
</div>
