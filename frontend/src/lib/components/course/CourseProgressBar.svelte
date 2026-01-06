<script lang="ts">
  import { Progress } from "$lib/components/ui/progress";

  type Props = {
    percentage: number;
  };

  let { percentage }: Props = $props();
</script>

<div>
  <h3 class="mb-2 text-lg font-semibold">Progreso del Curso</h3>
  <div class="flex items-center gap-4">
    <Progress value={percentage} class="w-full" />
    <span class="text-sm font-medium text-muted-foreground"
      >{Math.round(percentage)}%</span
    >
  </div>
</div>
