import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { eventService } from "$lib/services/event.service";

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    // Pass the fetch function from the load context
    const events = await eventService.getAllEvents({ fetch });
    return {
      events,
    };
  } catch (err) {
    console.error("Error fetching events:", err);
    throw error(500, "Could not load events");
  }
};
