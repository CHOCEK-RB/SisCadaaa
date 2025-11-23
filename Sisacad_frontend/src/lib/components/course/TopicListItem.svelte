<script lang="ts">
  import { CheckCircle } from "lucide-svelte";
  import type { CourseTopicDTO } from "$lib/types/course.types";

  type Props = {
    topic: CourseTopicDTO;
    isCompleted: boolean;
    isLast: boolean;
  };

  let { topic, isCompleted, isLast }: Props = $props();
</script>

<li>
  <div class="relative pb-8">
    {#if !isLast}
      <span
        class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
        aria-hidden="true"
      ></span>
    {/if}
    <div class="relative flex items-start space-x-3">
      <div class="relative" class:opacity-50={!isCompleted}>
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white"
          class:bg-green-500={isCompleted}
          class:text-white={isCompleted}
          class:bg-blue-500={!isCompleted}
        >
          <span>{topic.order}</span>
        </div>
        {#if isCompleted}
          <span
            class="absolute -right-1 -bottom-0.5 rounded-full bg-white px-0.5 py-0.5"
          >
            <CheckCircle class="h-4 w-4 text-primary" />
          </span>
        {/if}
      </div>
      <div class="min-w-0 flex-1 py-1.5" class:opacity-50={!isCompleted}>
        <div
          class="text-md"
          class:text-muted-foreground={isCompleted}
          class:text-foreground={!isCompleted}
          class:line-through={isCompleted}
        >
          {topic.topic}
        </div>
      </div>
    </div>
  </div>
</li>
