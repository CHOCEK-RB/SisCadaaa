<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button";
  import { Download } from "lucide-svelte";
  import type { CourseDTO } from "$lib/types/course.types";

  type Props = {
    course: CourseDTO;
    urlSyllabus: string | undefined | null;
  };

  let { course, urlSyllabus }: Props = $props();
</script>

<Card.Root>
  <Card.Header class="flex flex-row items-center justify-between">
    <div class="grid gap-1.5">
      <Card.Title>{course.name}</Card.Title>
      <Card.Description>
        {course.code} | {course.credits} Créditos | Semestre {course.semester}
      </Card.Description>
    </div>
    {#if urlSyllabus}
      <a href={urlSyllabus} target="_blank" rel="noopener noreferrer">
        <Button size="icon" variant="outline">
          <Download class="h-4 w-4" />
          <span class="sr-only">Descargar Syllabus</span>
        </Button>
      </a>
    {/if}
  </Card.Header>
</Card.Root>
