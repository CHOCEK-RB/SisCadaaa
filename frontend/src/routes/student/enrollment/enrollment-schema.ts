import { z } from "zod";
import type { AcademicCourseDTO } from "$lib/types/course.types";

export const getDynamicSchema = (courses: AcademicCourseDTO[] | null) => {
  return z
    .object(
      Object.fromEntries(
        courses!.map((course) => [
          course.id,
          z.string().optional().default(""),
        ]),
      ),
    )
    .refine(
      (data) => {
        return Object.values(data).some((value) => value);
      },
      {
        message: "Debes seleccionar al menos un grupo de laboratorio.",
        path: [],
      },
    );
};

export type EnrollmentFormSchema = ReturnType<typeof getDynamicSchema>;
