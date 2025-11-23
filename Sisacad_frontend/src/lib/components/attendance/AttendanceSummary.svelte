<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Progress } from "$lib/components/ui/progress";
  import { Users, UserCheck, UserX, Percent } from "lucide-svelte";
  import type { GroupAttendanceDTO } from "$lib/types/attendance.types";

  type Props = {
    summary: GroupAttendanceDTO;
  };
  let { summary }: Props = $props();

  const summaryCards = [
    {
      title: "Clases Totales",
      value: summary.totalClasses,
      icon: Users,
      color: "text-foreground",
    },
    {
      title: "Presente",
      value: summary.presentCount,
      icon: UserCheck,
      color: "text-green-500",
    },
    {
      title: "Ausente",
      value: summary.absentCount,
      icon: UserX,
      color: "text-red-500",
    },
    {
      title: "Asistencia",
      value: `${summary.attendancePercentage}%`,
      icon: Percent,
      color: "text-primary",
    },
  ];
</script>

<div>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
    {#each summaryCards as card (card.title)}
      <Card.Root>
        <Card.Header
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <Card.Title class="text-lg font-medium">{card.title}</Card.Title>
          <card.icon class="h-8 w-8 {card.color}" />
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">{card.value}</div>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
  <div class="mt-4">
    <Progress value={summary.attendancePercentage} class="w-full" />
  </div>
</div>
