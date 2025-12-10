<script lang="ts">
  import { Input } from "$lib/components/ui/input";

  let { 
    value, 
    isEditing, 
    onUpdate 
  }: { 
    value: number | null; 
    isEditing: boolean; 
    onUpdate: (val: number | null) => void 
  } = $props();

  // Helper para el color (solo visualización)
  function getGradeColor(val: number | null) {
    if (val === null || val < 0) return "text-gray-400";
    return val >= 10.5 ? "text-green-600 font-bold" : "text-red-600 font-bold";
  }

  // Helper para formatear
  function formatGrade(val: number | null) {
    return val === null ? "-" : val.toString();
  }
</script>

<div class="flex justify-center items-center h-full w-full">
  {#if isEditing}
    <Input
      type="number"
      class="h-8 w-16 text-center p-1 bg-white border-primary/50"
      min="0"
      max="20"
      value={value}
      oninput={(e) => {
        const val = parseFloat(e.currentTarget.value);
        // Si está vacío o es inválido enviamos null, si no el número
        onUpdate(isNaN(val) ? null : val);
      }}
    />
  {:else}
    <span class={getGradeColor(value)}>
      {formatGrade(value)}
    </span>
  {/if}
</div>