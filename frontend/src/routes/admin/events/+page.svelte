<script lang="ts">
  import type { PageData } from "./$types";
  import EventCard from "./EventCard.svelte";
  import CreateEventSheet from "./CreateEventSheet.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Plus } from "lucide-svelte";
  import { getLocalTimeZone, today } from "@internationalized/date";
  import { SvelteDate } from "svelte/reactivity";

  let { data }: { data: PageData } = $props();

  let showCreateSheet = $state(false);

  let events = $state(data.events);

  const categorizedEvents = $derived(() => {
    const active: typeof events = [];
    const pastActive: typeof events = [];
    const inactive: typeof events = [];
    const todayDate = today(getLocalTimeZone()).toDate(getLocalTimeZone());
    todayDate.setHours(0, 0, 0, 0);

    for (const event of data.events) {
      const eventEndDate = new SvelteDate(event.endDate);
      eventEndDate.setHours(0, 0, 0, 0);

      const isFuture = eventEndDate >= todayDate;

      if (event.isActive && isFuture) {
        active.push(event);
      } else if (event.isActive && !isFuture) {
        pastActive.push(event);
      } else {
        inactive.push(event);
      }
    }
    return { active, pastActive, inactive };
  });
</script>

<div class="container mx-auto p-4">
  <h1 class="mb-6 text-3xl font-bold">Gestion de Eventos</h1>

  <Button class="mb-6" onclick={() => (showCreateSheet = true)}>
    <Plus class="mr-2 h-4 w-4" />
    Crear Evento
  </Button>

  {#if categorizedEvents().active.length > 0}
    <h2 class="mb-4 text-2xl font-semibold">Eventos Activos</h2>
    <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each categorizedEvents().active as event (event.id)}
        <EventCard {event} />
      {/each}
    </div>
  {/if}

  {#if categorizedEvents().pastActive.length > 0}
    <h2 class="mb-4 text-2xl font-semibold">Eventos Pasados</h2>
    <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each categorizedEvents().pastActive as event (event.id)}
        <EventCard {event} />
      {/each}
    </div>
  {/if}

  {#if categorizedEvents().inactive.length > 0}
    <h2 class="mb-4 text-2xl font-semibold">Eventos Inactivos</h2>
    <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each categorizedEvents().inactive as event (event.id)}
        <EventCard {event} />
      {/each}
    </div>
  {/if}

  {#if categorizedEvents().active.length === 0 && categorizedEvents().pastActive.length === 0 && categorizedEvents().inactive.length === 0}
    <p class="text-center text-muted-foreground">No events found.</p>
  {/if}
</div>

<CreateEventSheet bind:open={showCreateSheet} />

