<script lang="ts">
  import type { LayoutData } from "./$types";
  import CourseLayout from "$lib/components/course/CourseLayout.svelte";

  let { data, children } = $props<{
    data: LayoutData;
    children: Svelte.Snippet;
  }>();
</script>

{#if data.user?.role}
  <CourseLayout courseDetails={data.courseDetails} role={data.user.role}>
    {@render children()}
  </CourseLayout>
{/if}
