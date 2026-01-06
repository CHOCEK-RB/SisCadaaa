<script lang="ts">
  import { BookUser, ChevronRight } from "lucide-svelte";
  import { Separator } from "$lib/components/ui/separator";

  import type {
    EnrollmentDetailDTO,
    GroupedEnrollments,
  } from "$lib/types/enrollment.types";

  import { courseExtractors, type DashboardCourseDisplay } from "$lib/config/access_courses";
  import type { UserRole } from "$lib/types/auth.types";
  import { currentUser } from "$lib/store/auth.store"; 

  const role = $derived($currentUser?.role || "unknown");
  let { rawData = null } = $props<{ rawData: any }>();
  //let { coursesByPeriod = {} }: { coursesByPeriod: GroupedEnrollments } =$props();

const currentCourses = $derived.by(() => {
      const extractor = courseExtractors[role as UserRole];
      const dataWrapper = role === 'teacher' 
          ? { groups: rawData } 
          : { courses: rawData };
      if (extractor && rawData) {
          return extractor(dataWrapper);
      }
      return [];
});
</script>


<div>
  {#if currentCourses.length > 0}
    <div class="space-y-2">
      {#each currentCourses as course, i (course.id)}
        <a
          href={course.link}
          class="no-underline"
        >
          <div
            class="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-accent"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <BookUser class="h-5 w-5" />
            </div>
            <div class="flex-1">
              <h4 class="font-semibold">
                {course.name}
              </h4>
              <p class="text-sm text-muted-foreground">
                Código: {course.code}
              </p>
            </div>
            <ChevronRight class="h-5 w-5 text-muted-foreground" />
          </div>
        </a>
        {#if i < currentCourses.length - 1}
          <Separator />
        {/if}
      {/each}
    </div>
  {:else}
    <div class="text-center text-muted-foreground">
      <p>No estás inscrito en ningún curso actualmente.</p>
    </div>
  {/if}
</div>


<!--
<div>
  {#if currentCourses().length > 0}
    <div class="space-y-2">
      {#each currentCourses() as enrollment, i (enrollment.id)}
        <a
          href={`/student/courses/${enrollment.academicCourse.id}`}
          class="no-underline"
        >
          <div
            class="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-accent"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <BookUser class="h-5 w-5" />
            </div>
            <div class="flex-1">
              <h4 class="font-semibold">
                {enrollment.academicCourse.course.name}
              </h4>
              <p class="text-sm text-muted-foreground">
                Código: {enrollment.academicCourse.course.code}
              </p>
            </div>
            <ChevronRight class="h-5 w-5 text-muted-foreground" />
          </div>
        </a>
        {#if i < currentCourses().length - 1}
          <Separator />
        {/if}
      {/each}
    </div>
  {:else}
    <div class="text-center text-muted-foreground">
      <p>No estás inscrito en ningún curso actualmente.</p>
    </div>
  {/if}
</div>
-->