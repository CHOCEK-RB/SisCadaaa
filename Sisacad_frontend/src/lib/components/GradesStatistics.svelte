<script lang="ts">
  import type { GradesAndPercent } from "$lib/services/enrollment.service";
  import { Target, Award, AlertCircle, BookCopy } from "lucide-svelte";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";

  export interface CourseAverage {
    name: string;
    average: number;
  }

  let { gradesData = [] } = $props<{
    gradesData: GradesAndPercent[];
  }>();

  const statistics = $derived(() => {
    const coursesWithAvg = gradesData
      .map((item: GradesAndPercent) => {
        if (!item.grades || !item.percent) return null;

        let total = 0;
        for (const key in item.grades) {
          if (Object.prototype.hasOwnProperty.call(item.grades, key)) {
            const grade = item.grades[key as keyof typeof item.grades] ?? 0;
            const weight =
              (item.percent[key as keyof typeof item.percent] ?? 0) / 100;
            total += grade * weight;
          }
        }
        return {
          name: item.course.course?.name || "Sin nombre",
          average: total,
        };
      })
      .filter(
        (c: CourseAverage): c is CourseAverage => c !== null && c.average > 0,
      );

    if (coursesWithAvg.length === 0) {
      return {
        generalAverage: 0,
        highestGrade: 0,
        lowestGrade: 0,
        highestCourse: "",
        lowestCourse: "",
        approvedCount: 0,
        failedCount: 0,
        pendingCount: gradesData.length,
      };
    }

    const highest = coursesWithAvg.reduce(
      (max: CourseAverage, course: CourseAverage) =>
        course.average > max.average ? course : max,
      coursesWithAvg[0],
    );

    const lowest = coursesWithAvg.reduce(
      (min: CourseAverage, course: CourseAverage) =>
        course.average < min.average ? course : min,
      coursesWithAvg[0],
    );

    const generalAverage =
      coursesWithAvg.reduce(
        (sum: number, c: CourseAverage) => sum + c.average,
        0,
      ) / coursesWithAvg.length;

    const approvedCount = coursesWithAvg.filter(
      (c: CourseAverage) => c.average >= 10.5,
    ).length;
    const failedCount = coursesWithAvg.length - approvedCount;
    const pendingCount = gradesData.length - coursesWithAvg.length;

    return {
      generalAverage: generalAverage,
      highestGrade: highest.average,
      lowestGrade: lowest.average,
      highestCourse: highest.name,
      lowestCourse: lowest.name,
      approvedCount,
      failedCount,
      pendingCount,
    };
  });
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card.Root>
    <Card.Header
      class="flex flex-row items-center justify-between space-y-0 pb-2"
    >
      <Card.Title class="text-sm font-medium">Promedio General</Card.Title>
      <Target class="h-4 w-4 text-muted-foreground" />
    </Card.Header>
    <Card.Content>
      <div class="text-2xl font-bold text-primary">
        {statistics().generalAverage.toFixed(2)}
      </div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header
      class="flex flex-row items-center justify-between space-y-0 pb-2"
    >
      <Card.Title class="text-sm font-medium">Nota Más Alta</Card.Title>
      <Award class="h-4 w-4 text-green-500" />
    </Card.Header>
    <Card.Content>
      <div class="text-2xl font-bold text-green-500">
        {statistics().highestGrade.toFixed(2)}
      </div>
      <p class="truncate text-xs text-muted-foreground">
        {statistics().highestCourse}
      </p>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header
      class="flex flex-row items-center justify-between space-y-0 pb-2"
    >
      <Card.Title class="text-sm font-medium">Nota Más Baja</Card.Title>
      <AlertCircle class="h-4 w-4 text-red-500" />
    </Card.Header>
    <Card.Content>
      <div class="text-2xl font-bold text-red-500">
        {statistics().lowestGrade.toFixed(2)}
      </div>
      <p class="truncate text-xs text-muted-foreground">
        {statistics().lowestCourse}
      </p>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header
      class="flex flex-row items-center justify-between space-y-0 pb-2"
    >
      <Card.Title class="text-sm font-medium">Estado de Cursos</Card.Title>
      <BookCopy class="h-4 w-4 text-muted-foreground" />
    </Card.Header>
    <Card.Content class="flex justify-around">
      <div class="text-center">
        <Badge variant="default" class="text-lg"
          >{statistics().approvedCount}</Badge
        >
        <p class="text-xs text-muted-foreground">Aprob.</p>
      </div>
      <div class="text-center">
        <Badge variant="destructive" class="text-lg"
          >{statistics().failedCount}</Badge
        >
        <p class="text-xs text-muted-foreground">Reprob.</p>
      </div>
      <div class="text-center">
        <Badge variant="secondary" class="text-lg"
          >{statistics().pendingCount}</Badge
        >
        <p class="text-xs text-muted-foreground">Pend.</p>
      </div>
    </Card.Content>
  </Card.Root>
</div>
