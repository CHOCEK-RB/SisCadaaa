<script lang="ts">
  import type { AcademicGroupDTO } from '$lib/types/group.types';

  let { groups = [], showCourseName = false } = $props<{
    groups: AcademicGroupDTO[];
    showCourseName?: boolean;
  }>();

  console.log('aaaaaaaaaaa', groups);

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const dayMap: Record<string, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    lunes: 'Lunes',
    martes: 'Martes',
    miércoles: 'Miércoles',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sábado: 'Sábado',
    sabado: 'Sábado',
  };

  interface TimeSlot {
    start: string;
    end: string;
  }
  const timeSlots: TimeSlot[] = [
    { start: '07:00', end: '07:50' },
    { start: '07:50', end: '08:40' },
    { start: '08:50', end: '09:40' },
    { start: '09:40', end: '10:30' },
    { start: '10:40', end: '11:30' },
    { start: '11:30', end: '12:20' },
    { start: '12:20', end: '13:10' },
    { start: '13:10', end: '14:00' },
    { start: '14:00', end: '14:50' },
    { start: '14:50', end: '15:40' },
    { start: '15:50', end: '16:40' },
    { start: '16:40', end: '17:30' },
    { start: '17:40', end: '18:30' },
    { start: '18:30', end: '19:20' },
    { start: '19:20', end: '20:10' },
  ];

  interface ScheduleCell {
    day: string;
    startHour: string;
    endHour: string;
    group: AcademicGroupDTO;
    schedule: any;
  }

  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  function normalizeTime(time: string): string {
    const parts = time.split(':');
    const hours = parts[0].padStart(2, '0');
    const minutes = (parts[1] || '00').padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function getTypeColor(type: string): string {
    switch (type?.toLowerCase()) {
      case 'theory':
      case 'teoría':
      case 'teoria':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'laboratory':
      case 'laboratorio':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'practice':
      case 'práctica':
      case 'practica':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  }

  function getTypeLabel(type: string): string {
    switch (type?.toLowerCase()) {
      case 'theory':
      case 'teoría':
      case 'teoria':
        return 'Teoría';
      case 'laboratory':
      case 'laboratorio':
        return 'Laboratorio';
      case 'practice':
      case 'práctica':
      case 'practica':
        return 'Práctica';
      default:
        return type || 'Clase';
    }
  }

  const scheduleData = $derived(() => {
    const cells: ScheduleCell[] = [];

    groups.forEach((group: AcademicGroupDTO) => {
      if (!group.schedule) return;

      group.schedule.forEach((slot) => {
        const dayName = dayMap[slot.day.toLowerCase()];
        if (!dayName) {
          console.warn('Day not mapped:', slot.day);
          return;
        }

        const startTime = normalizeTime(slot.start);
        const endTime = normalizeTime(slot.end);

        cells.push({
          day: dayName,
          startHour: startTime,
          endHour: endTime,
          group,
          schedule: slot,
        });
      });
    });

    return cells;
  });

  function findEventForSlot(day: string, slot: TimeSlot): ScheduleCell | null {
    const slotStartMinutes = timeToMinutes(slot.start);

    const event = scheduleData().find((cell) => {
      if (cell.day !== day) return false;

      const cellStartMinutes = timeToMinutes(cell.startHour);
      const cellEndMinutes = timeToMinutes(cell.endHour);

      return (
        slotStartMinutes >= cellStartMinutes &&
        slotStartMinutes < cellEndMinutes
      );
    });

    return event || null;
  }
</script>

<div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
  <table class="min-w-full border-collapse bg-white">
    <thead>
      <tr class="bg-gray-50">
        <th
          class="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 w-28"
        >
          Hora
        </th>
        {#each days as day (day)}
          <th
            class="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[180px]"
          >
            {day}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each timeSlots as slot (slot.start)}
        <tr class="hover:bg-gray-50">
          <td
            class="border border-gray-200 px-2 py-3 text-xs font-medium text-gray-600 bg-gray-50 sticky left-0 z-10 text-center"
          >
            {slot.start}
            <br />
            {slot.end}
          </td>

          {#each days as day (day)}
            {@const cell = findEventForSlot(day, slot)}

            {#if cell}
              <td class="border border-gray-200 p-2 align-top">
                <div
                  class="rounded-lg border-2 p-3 h-full {getTypeColor(
                    cell.group.type,
                  )} transition-all hover:shadow-md"
                >
                  {#if showCourseName && cell.group.course?.course?.name}
                    <p
                      class="font-bold text-sm mb-1 line-clamp-2"
                      title={cell.group.course.course.name}
                    >
                      {cell.group.course.course.name}
                    </p>
                  {/if}
                  <p class="font-semibold text-sm mb-1">
                    {cell.group.name}
                  </p>
                  <p class="text-xs mb-1 opacity-80">
                    {getTypeLabel(cell.group.type)}
                  </p>
                  <p class="text-xs mb-1 font-medium">
                    ⏰ {cell.schedule.start} - {cell.schedule.end}
                  </p>
                  {#if cell.schedule.classroom}
                    <p class="text-xs font-medium">
                      📍 {cell.schedule.classroom.name}
                    </p>
                  {/if}
                  {#if cell.group.teacher}
                    <p class="text-xs mt-1 opacity-70">
                      👤 {cell.group.teacher.firstName}
                      {cell.group.teacher.lastName}
                    </p>
                  {/if}
                </div>
              </td>
            {:else}
              <td class="border border-gray-200 bg-gray-50"></td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
