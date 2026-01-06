<script lang="ts">
  import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
  import { Label } from "$lib/components/ui/label";
  import type { AcademicGroupDTO } from "$lib/types/group.types";
  import { AlertCircle, CheckCircle2 } from "lucide-svelte";

  let {
    groups = [],
    selectedValue = "",
    onSelect = () => {},
    conflicts = {},
  }: {
    groups: AcademicGroupDTO[];
    selectedValue: string;
    onSelect: (value: string) => void;
    conflicts: Record<string, string>;
  } = $props();
</script>

<RadioGroup {selectedValue} onValueChange={onSelect} class="gap-4">
  {#each groups as group (group.id)}
    {@const conflictMessage = conflicts[group.id]}
    {@const isSelected = selectedValue === group.id}
    {@const isDisabled = !!conflictMessage && !isSelected}
    <Label
      for={group.id}
      class={`flex flex-col items-start gap-4 rounded-lg border p-4 transition-all hover:bg-accent/50 ${
        isSelected
          ? "border-primary bg-accent/80"
          : isDisabled
            ? "cursor-not-allowed border-dashed border-destructive/50 bg-destructive/10"
            : "cursor-pointer"
      }`}
    >
      <div class="flex w-full items-center justify-between">
        <div class="flex items-center gap-3">
          <RadioGroupItem
            value={group.id}
            id={group.id}
            disabled={isDisabled}
          />
          <span class="font-semibold">Grupo {group.name}</span>
        </div>
        {#if isSelected}
          <CheckCircle2 class="h-5 w-5 text-primary" />
        {/if}
      </div>

      <div class="space-y-1 text-sm text-muted-foreground">
        {#each group.schedule || [] as slot (slot.id)}
          <p>
            {slot.day}: {slot.start} - {slot.end} (Aula: {slot.classroom.name})
          </p>
        {/each}
      </div>

      {#if isDisabled}
        <div class="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle class="h-4 w-4" />
          <span>{conflictMessage}</span>
        </div>
      {/if}
    </Label>
  {/each}
</RadioGroup>
