import { z } from "zod";

export const timeSlots = [
  "07:00",
  "07:50",
  "08:50",
  "09:40",
  "10:40",
  "11:30",
  "12:20",
  "13:10",
  "14:00",
  "14:50",
  "15:50",
  "16:40",
  "17:40",
  "18:30",
  "19:20",
  "20:10",
];

export const reservationSchema = z
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

export type ReservationSchema = typeof reservationSchema;
