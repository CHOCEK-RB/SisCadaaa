import { redirect, fail } from "@sveltejs/kit";
import { zod4 } from "sveltekit-superforms/adapters";
import { superValidate } from "sveltekit-superforms/server";
import type { Actions, PageServerLoad } from "./$types";
import { reservationService } from "$lib/services/reservation.service";
import { classroomService } from "$lib/services/classroom.service";
import { timeSlots, reservationSchema } from "./schema";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const form = await superValidate(zod4(reservationSchema), {
    defaults: {
      date: new Date(),
      startTime: timeSlots[0],
      endTime: timeSlots[1],
    },
  });
  console.log("Form object in load function:", form);
  const [classroom, classroomSchedule] = await Promise.all([
    classroomService.findById(params.id, { fetch }),
    classroomService.getScheduleForClassroom(params.id, { fetch }),
  ]);

  return {
    form,
    classroom,
    schedule: classroomSchedule,
    classroomId: params.id,
    timeSlots,
  };
};

export const actions: Actions = {
  default: async (event) => {
    console.log("--- CREATE RESERVATION ACTION ---");
    const form = await superValidate(event.request, zod4(reservationSchema));
    if (!form.valid) {
      console.log("Form is invalid:", form.errors);
      return fail(400, { form });
    }

    console.log("Form data is valid:", form.data);

    try {
      const classroomId = event.params.id;
      const { date, startTime, endTime } = form.data;

      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const startDateTime = new Date(date);
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      console.log("Start DateTime:", startDateTime.toISOString());

      const [endHours, endMinutes] = endTime.split(":").map(Number);
      const endDateTime = new Date(date);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      console.log("End DateTime:", endDateTime.toISOString());

      const reservationData = {
        classroomId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };

      console.log(
        "Calling reservationService.createReservation with:",
        reservationData,
      );
      const result = await reservationService.createReservation(
        reservationData,
        { fetch: event.fetch },
      );
      console.log("Reservation service result:", result);
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      return fail(500, {
        form,
        error:
          error.data?.message || "Error en el servidor al crear la reserva.",
      });
    }

    console.log("Redirecting to /teacher/schedule...");
    throw redirect(303, "/teacher/schedule");
  },
};
