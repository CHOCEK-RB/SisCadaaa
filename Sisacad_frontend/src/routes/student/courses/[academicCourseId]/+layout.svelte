<script lang="ts">
  import type { LayoutData } from './$types';
  import CourseLayout from '$lib/components/course/CourseLayout.svelte';

  let { data, children } = $props<{ data: LayoutData; children: Svelte.Snippet }>();
</script>

<CourseLayout courseDetails={data.courseDetails}>
  {@render children()}
</CourseLayout>
