<script lang="ts">
  import type { Classroom, ClassroomType } from "$lib/types/classroom.types";
  import type { Reservation } from "$lib/types/reservation.types";
  import { onMount } from "svelte";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { cn } from "$lib/utils";

  export let classroom: Classroom;
  export let reservations: Reservation[];

  let isOccupied = false;
  let statusClass = "";

  const typeTranslations: Record<ClassroomType, string> = {
    normal: "Teoría",
    laboratory: "Laboratorio",
  };

  function getFloor(name: string): number {
    return parseInt(name.charAt(0), 10);
  }

  function checkStatus() {
    const now = new Date();
    isOccupied = reservations.some((res) => {
      const startTime = new Date(res.startTime);
      const endTime = new Date(res.endTime);
      return (
        res.classroom.id === classroom.id &&
        now >= startTime &&
        now < endTime &&
        res.status === "active"
      );
    });
    statusClass = isOccupied
      ? "bg-red-200 dark:bg-red-900/50 border-red-300 dark:border-red-800"
      : "bg-green-200 dark:bg-green-900/50 border-green-300 dark:border-green-800";
  }

  onMount(() => {
    checkStatus();
    // Check status every minute
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  });
</script>

<a
  href="/teacher/reservation/{classroom.id}"
  class="block transition-transform duration-200 hover:scale-105"
>
  <Card.Root class={cn("text-center", statusClass)}>
    <Card.Header class="pb-2">
      <Card.Title class="text-2xl font-bold">Aula {classroom.name}</Card.Title>
    </Card.Header>
    <Card.Content>
      <Badge class="text-lg" variant="secondary"
        >{typeTranslations[classroom.type]}</Badge
      >
      <p class="mt-2 text-lg text-muted-foreground">
        Piso {getFloor(classroom.name)}
      </p>
    </Card.Content>
  </Card.Root>
</a>
