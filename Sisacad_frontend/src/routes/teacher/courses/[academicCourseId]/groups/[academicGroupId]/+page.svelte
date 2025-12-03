<script lang="ts">
  import type { PageData } from "./$types";
  import { toast } from "svelte-sonner";
  import TeacherCourseHeader from "$lib/components/course/TeacherCourseHeader.svelte";
  import TeacherTopicsList from "$lib/components/course/TeacherTopicsList.svelte";
  import { superForm } from "sveltekit-superforms";

  let { data } = $props<{ data: PageData }>();

  const { courseDetails } = data;

  const form = superForm(data.form, {
    onUpdated: ({ form: f }) => {
      if (f.valid) {
        toast.success("Progreso del curso actualizado!");
        form.reset(data.form);
      }
    },
  });

  const sortedTopics = $derived(
    [...(courseDetails?.topics ?? [])].sort((a, b) => a.order - b.order),
  );
</script>

<svelte:head>
  <title>Información: {courseDetails?.course?.name || "Curso"} - Sisacad</title>
</svelte:head>

<div class="space-y-6">
  <TeacherCourseHeader {courseDetails} />
  <TeacherTopicsList topics={sortedTopics} {form} />
</div>
