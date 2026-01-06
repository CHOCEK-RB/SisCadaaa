<script lang="ts">
  import { cn } from "$lib/utils";
  import { Badge } from "$lib/components/ui/badge";
  import { Progress } from "$lib/components/ui/progress";

  let { finalGrade, passingGrade = 10.5 } = $props<{
    finalGrade: () => number;
  }>();

  const neededToPass = $derived(() => {
    return Math.max(0, passingGrade - finalGrade());
  });
</script>

<div class="space-y-6">
  <div class="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
    <div class="rounded-lg border border-primary bg-primary/10 p-4">
      <p class="text-sm font-medium text-muted-foreground">Promedio Final</p>
      <p
        class={cn(
          "mt-1 text-4xl font-bold",
          finalGrade() >= passingGrade ? "text-green-500" : "text-red-500",
        )}
      >
        {finalGrade().toFixed(2)}
      </p>
    </div>
    <div class="rounded-lg border border-primary bg-primary/10 p-4">
      <p class="text-sm font-medium text-muted-foreground">Estado</p>
      <Badge
        variant={finalGrade() >= passingGrade ? "default" : "destructive"}
        class="mt-2 text-lg"
      >
        {finalGrade() >= passingGrade ? "Aprobado" : "Desaprobado"}
      </Badge>
    </div>
    <div class="rounded-lg border border-primary bg-primary/10 p-4">
      <p class="text-sm font-medium text-muted-foreground">
        Puntos para Aprobar
      </p>
      <p class="mt-1 text-4xl font-bold text-foreground">
        {neededToPass().toFixed(2)}
      </p>
    </div>
  </div>
  <Progress value={(finalGrade() / 20) * 100} class="w-full" />
</div>
