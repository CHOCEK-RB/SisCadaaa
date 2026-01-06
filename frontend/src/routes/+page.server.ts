import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    if (locals.user.role === "student") {
      throw redirect(303, "/student");
    } else if (locals.user.role === "teacher") {
      throw redirect(303, "/teacher");
    } else if (locals.user.role === "secretary") {
      throw redirect(303, "/secretary");
    }
  } else {
    throw redirect(303, "/login");
  }
};
