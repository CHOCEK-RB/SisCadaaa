<script lang="ts">
  let { value, textColorClass = "" } = $props<{
    value: string | number;
    textColorClass?: string;
  }>();
</script>

<div class={textColorClass}>
  {value}
</div>
