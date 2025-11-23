<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card";
  import type { LayoutData } from "./$types";
  import CourseHeader from "$lib/components/course/CourseHeader.svelte";
  import CourseProgressBar from "$lib/components/course/CourseProgressBar.svelte";
  import TopicsList from "$lib/components/course/TopicsList.svelte";

  let { data } = $props<{ data: LayoutData }>();
  const { courseDetails } = data;

  const sortedTopics = $derived(
    [...(courseDetails?.topics ?? [])].sort(
      (a, b) => a.topicOrder - b.topicOrder,
    ),
  );

  const progress = $derived(
    courseDetails?.progress?.find((p) => p.groupName === "A"),
  );

  const completedTopicIds = $derived(
    new Set(progress?.completedTopics.map((t) => t.id)),
  );

  const progressPercentage = $derived(
    sortedTopics.length > 0
      ? (completedTopicIds.size / sortedTopics.length) * 100
      : 0,
  );
</script>

<svelte:head>
  <title>Info: {courseDetails?.course?.name ?? "Curso"} - Sisacad</title>
</svelte:head>

{#if courseDetails}
  <div class="space-y-6">
    <Card>
      <CourseHeader
        course={courseDetails.course}
        urlSyllabus={courseDetails.urlSyllabus}
      />
      <CardContent class="space-y-6 pt-6">
        {#if progress && sortedTopics.length > 0}
          <CourseProgressBar percentage={progressPercentage} />
        {/if}
        <TopicsList topics={sortedTopics} {completedTopicIds} />
      </CardContent>
    </Card>
  </div>
{:else}
  <p>Cargando detalles del curso...</p>
{/if}
