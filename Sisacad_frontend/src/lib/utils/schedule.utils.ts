import type { ScheduleSlotDTO } from '$lib/types/group.types';

/**
 * Converts a time string (e.g., "09:00") to minutes from the start of the day.
 * @param timeStr The time string to convert.
 * @returns The number of minutes from midnight.
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Checks if two schedule slots overlap.
 * @param slotA The first schedule slot.
 * @param slotB The second schedule slot.
 * @returns True if the slots overlap, false otherwise.
 */
export function schedulesOverlap(
  slotA: ScheduleSlotDTO,
  slotB: ScheduleSlotDTO,
): boolean {
  if (slotA.day !== slotB.day) {
    return false;
  }

  const startA = timeToMinutes(slotA.start);
  const endA = timeToMinutes(slotA.end);
  const startB = timeToMinutes(slotB.start);
  const endB = timeToMinutes(slotB.end);

  // Overlap occurs if one slot starts before the other ends, and ends after the other starts.
  return startA < endB && endA > startB;
}

/**
 * Converts a day key (e.g., 'monday') to its Spanish name.
 * @param dayKey The day key string.
 * @returns The Spanish name of the day.
 */
export function getDayName(dayKey: string): string {
  const days: Record<string, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };
  return days[dayKey.toLowerCase()] || dayKey;
}
