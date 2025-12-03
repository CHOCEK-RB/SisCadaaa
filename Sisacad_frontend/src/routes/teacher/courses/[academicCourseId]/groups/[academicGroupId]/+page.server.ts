import { superValidate, message } from "sveltekit-superforms";
import type { PageServerLoad, Actions } from "./$types";
import { zod4 } from "sveltekit-superforms/adapters";
import { updateTopicsSchema } from "./topics-schema";
import { academicCourseService } from "$lib/services/academic_course.service";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { academicCourseId } = params;
  const courseDetails = await academicCourseService.getCourse(
    academicCourseId,
    { fetch },
  );
  const groupName = "A";
  const progress = courseDetails?.progress?.find(
    (p) => p.groupName === groupName,
  );
  const completedTopics = progress?.completedTopics.map((t) => t.id) ?? [];

  const form = await superValidate(zod4(updateTopicsSchema), {
    defaults: { completedTopics, groupName },
  });
  return { form, courseDetails };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, zod4(updateTopicsSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      await academicCourseService.updateTopicProgress(
        event.params.academicCourseId,
        form.data,
        {
          fetch: event.fetch,
        },
      );
    } catch (error) {
      console.error("Error updating topic progress:", error);
      return fail(500, {
        message: "Error updating topic progress",
      });
    }

    return message(form, "Progreso del curso actualizado!");
  },
};
