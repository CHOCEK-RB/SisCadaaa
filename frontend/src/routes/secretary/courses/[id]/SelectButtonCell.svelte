<script lang="ts">
  import { Button } from "$lib/components/ui/button";

  let { onClick } = $props<{ onClick: () => void }>();
</script>

<Button type="button" size="sm" onclick={onClick}>Seleccionar</Button>
