import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, cookies }) => {
  locals.user = null;

  cookies.delete("jwt_token", {
    path: "/",
  });

  throw redirect(303, "/login");
};
