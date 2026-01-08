import { userService } from "$lib/services/user.service";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, fetch }) => {
  const page = Number(url.searchParams.get("page") ?? 1);
  const limit = Number(url.searchParams.get("limit") ?? 10);
  const searchQuery = url.searchParams.get("searchQuery") ?? "";
  const sortBy = url.searchParams.get("sortBy") ?? undefined;
  const order = url.searchParams.get("order") ?? undefined;

  console.log("Loading students with params:", {
    page,
    limit,
    searchQuery,
    sortBy,
    order,
  });

  try {
    const users = await userService.getStudents({
      page,
      limit,
      searchQuery,
      sortBy,
      order,
      fetch,
    });

    return {
      students: users.data,
      total: users.total,
      page,
      limit,
    };
  } catch (error) {
    console.error("Error fetching students:", error);
    return {
      students: [],
      total: 0,
      page,
      limit,
      error: "No se pudieron cargar los estudiantes.",
    };
  }
};
