<script lang="ts">
  import type { CourseTopicDTO } from "$lib/types/course.types";
  import TopicListItem from "./TopicListItem.svelte";

  type Props = {
    topics: CourseTopicDTO[];
    completedTopicIds: Set<string>;
  };

  let { topics, completedTopicIds }: Props = $props();
</script>

<div>
  <h3 class="mb-4 text-lg font-semibold">Temario del Curso</h3>
  {#if topics.length > 0}
    <div class="flow-root">
      <ul class="-mb-8">
        {#each topics as topic, i (topic.id)}
          <TopicListItem
            {topic}
            isCompleted={completedTopicIds.has(topic.id)}
            isLast={i === topics.length - 1}
          />
        {/each}
      </ul>
    </div>
  {:else}
    <div
      class="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-200 p-8 text-center"
    >
      <p class="text-sm font-medium text-muted-foreground">
        No se han registrado temas para este curso.
      </p>
      <p class="mt-1 text-xs text-muted-foreground">
        El temario aparecerá aquí cuando esté disponible.
      </p>
    </div>
  {/if}
</div>
