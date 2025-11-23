import { redirect, type Handle } from "@sveltejs/kit";
import { JWT_SECRET } from "$env/static/private";
import jwt from "jsonwebtoken";
import type { UserSession } from "$lib/types/auth.types";

const protectedRoutes = ["/student", "/student/courses"];

const publicRoutes = ["/login"];

function verifyToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;

    const user: UserSession = {
      sub: decoded.sub,
      email: decoded.email,
      pictureURL: decoded.pictureURL,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    return user;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  let token = event.cookies.get("auth_token");

  if (!token) {
    token = event.cookies.get("jwt_token");
  }

  if (token) {
    const user = verifyToken(token);

    if (user) {
      event.locals.user = user;
    } else {
      event.locals.user = null;
      event.cookies.delete("auth_token", { path: "/" });
      event.cookies.delete("jwt_token", { path: "/" });
    }
  } else {
    event.locals.user = null;
  }

  const pathname = event.url.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !event.locals.user) {
    throw redirect(303, `/login?redirectTo=${pathname}`);
  }

  if (isPublicRoute && event.locals.user) {
    throw redirect(303, "/");
  }

  return resolve(event);
};
