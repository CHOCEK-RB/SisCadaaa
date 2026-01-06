<script lang="ts">
  import type { Classroom } from "$lib/types/classroom.types";
  import type { Reservation } from "$lib/types/reservation.types";
  import ClassroomBlock from "./ClassroomBlock.svelte";

  export let classrooms: Classroom[];
  export let reservations: Reservation[];

  function getFloor(name: string): number {
    const floorNumber = parseInt(name.charAt(0), 10);
    return isNaN(floorNumber) ? 0 : floorNumber;
  }

  const floors: { [key: number]: Classroom[] } = classrooms.reduce(
    (acc, classroom) => {
      const floor = getFloor(classroom.name);
      if (!acc[floor]) {
        acc[floor] = [];
      }
      acc[floor].push(classroom);
      return acc;
    },
    {} as { [key: number]: Classroom[] },
  );
</script>

<div class="m-4 space-y-12">
  {#each Object.entries(floors).sort(([a], [b]) => parseInt(a) - parseInt(b)) as [floorNumber, floorClassrooms] (floorNumber)}
    <div>
      <h2 class="mb-4 text-3xl font-bold">Piso {floorNumber}</h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each floorClassrooms.sort( (a, b) => a.name.localeCompare(b.name), ) as classroom (classroom.id)}
          <ClassroomBlock {classroom} {reservations} />
        {/each}
      </div>
    </div>
  {/each}
</div>
