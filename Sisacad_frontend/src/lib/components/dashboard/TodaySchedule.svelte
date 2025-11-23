<script lang="ts">
  import { Clock, MapPin } from "lucide-svelte";
  import { Separator } from "$lib/components/ui/separator";
  import type { AcademicGroupDTO } from "$lib/types/group.types";

  let { schedule = [] }: { schedule: AcademicGroupDTO[] } = $props();

  const dayMap = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = new Date();
  const todayName = dayMap[today.getDay()];

  const todaysClasses = $derived(() => {
    const classes: any[] = [];
    if (schedule) {
      schedule.forEach((group) => {
        group.schedule?.forEach((slot) => {
          if (slot.day === todayName) {
            classes.push({
              courseName: group.course.course.name,
              startTime: slot.start,
              endTime: slot.end,
              classroom: slot.classroom.name,
            });
          }
        });
      });
    }
    // Sort by start time
    return classes.sort((a, b) => a.startTime.localeCompare(b.startTime));
  });
</script>

<div>
  {#if todaysClasses().length > 0}
    <div class="space-y-4">
      {#each todaysClasses() as classItem, i (classItem.courseName + classItem.startTime)}
        <div class="flex items-start gap-4">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <Clock class="h-5 w-5" />
          </div>
          <div class="flex-1">
            <h4 class="font-semibold">{classItem.courseName}</h4>
            <p class="text-sm text-muted-foreground">
              {classItem.startTime} - {classItem.endTime}
            </p>
            <div class="mt-1 flex items-center text-xs text-muted-foreground">
              <MapPin class="mr-1 h-3 w-3" />
              <span>{classItem.classroom}</span>
            </div>
          </div>
        </div>
        {#if i < todaysClasses().length - 1}
          <Separator class="my-4" />
        {/if}
      {/each}
    </div>
  {:else}
    <div class="text-center text-muted-foreground">
      <p>No tienes clases programadas para hoy.</p>
      <p class="text-sm">¡Disfruta tu día libre!</p>
    </div>
  {/if}
</div>
