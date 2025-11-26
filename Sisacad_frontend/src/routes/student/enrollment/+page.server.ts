import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { enrollmentService } from "$lib/services/enrollment.service";
import { superValidate, message } from "sveltekit-superforms/server";
import { zod4 } from "sveltekit-superforms/adapters";
import { getDynamicSchema } from "./enrollment-schema";

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (locals.user?.role !== "student") {
    throw redirect(303, "/");
  }

  try {
    const isPeriodActive = (
      await enrollmentService.getLabEnrollmentStatus({ fetch })
    )?.isActive;

    const availableCourses = await enrollmentService.getAvailableLabGroups({
      fetch,
    });

    const mySchedule =
      isPeriodActive && availableCourses && availableCourses.length > 0
        ? await enrollmentService.getMySchedule({ fetch })
        : [];

    const schema = getDynamicSchema(availableCourses || []);

    const initialFormData: Record<string, string> = {};
    if (availableCourses) {
      for (const course of availableCourses) {
        initialFormData[course.id] = course.currentlyEnrolledLabGroupId || "";
      }
    }

    const form = await superValidate(zod4(schema), {
      defaults: initialFormData,
    });

    return {
      form,
      isPeriodActive: isPeriodActive ?? false,
      availableCourses,
      mySchedule,
    };
  } catch (err: any) {
    console.error("Error loading enrollment page:", err);
    const form = await superValidate(zod4(getDynamicSchema(null)));
    return {
      form,
      availableCourses: null,
      mySchedule: null,
      isPeriodActive: false,
      error:
        "No se pudo cargar la información de matrícula. " +
        (err.message || "Inténtalo de nuevo más tarde."),
    };
  }
};

export const actions: Actions = {
  default: async ({ request, fetch }) => {
    const availableCourses = await enrollmentService.getAvailableLabGroups({
      fetch,
    });
    const schema = getDynamicSchema(availableCourses);

    const form = await superValidate(request, zod4(schema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const labGroupIds = Object.values(form.data).filter(
      (id) => id && id !== "_dummy",
    ) as string[];

    if (labGroupIds.length === 0) {
      return fail(400, {
        ...form.data,
        message: "No se seleccionó ningún grupo.",
      });
    }

    try {
      await enrollmentService.enrollInLabGroups(labGroupIds, { fetch });
      return message(form, "¡Matrícula guardada con éxito!");
    } catch (error: any) {
      console.error("Error submitting enrollment:", error);
      return fail(500, {
        form,
        error:
          error.data?.message ||
          error.message ||
          "Error del servidor al procesar la matrícula.",
      });
    }
  },
};
