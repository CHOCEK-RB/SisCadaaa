<script lang="ts">
  type StatusType = "Aprobado" | "Reprobado" | "Pendiente";

  let { status }: { status: StatusType } = $props();

  const statusClasses = {
    Aprobado: "bg-primary text-primary-foreground",
    Reprobado: "bg-destructive text-destructive-foreground",
    Pendiente: "bg-secondary text-secondary-foreground",
  };
</script>

<div
  class="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none {statusClasses[
    status
  ]}"
>
  {status}
</div>
