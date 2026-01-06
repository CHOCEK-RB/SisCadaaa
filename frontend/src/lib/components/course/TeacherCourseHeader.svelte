<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Upload, Download, FileText, Info } from "lucide-svelte";
  import type { AcademicCourseDTO } from "$lib/types/course.types";

  type Props = {
    courseDetails: AcademicCourseDTO | undefined;
  };

  let { courseDetails }: Props = $props();

  console.log(courseDetails);

  function handleUploadSyllabus() {
    alert(
      "Aquí se implementará la lógica para subir o reemplazar el archivo del sílabo.",
    );
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title class="flex items-center gap-2">
      <Info class="h-5 w-5 text-blue-600" />
      Detalles del Curso
    </Card.Title>
  </Card.Header>
  <Card.Content>
    <dl class="space-y-3">
      <div class="flex justify-between">
        <dt class="text-sm font-medium text-gray-500">Créditos</dt>
        <dd class="text-sm font-semibold text-gray-900">
          {courseDetails?.course?.credits ?? "N/A"}
        </dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-sm font-medium text-gray-500">Semestre</dt>
        <dd class="text-sm font-semibold text-gray-900">
          {courseDetails?.course?.semester ?? "N/A"}
        </dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-sm font-medium text-gray-500">Año</dt>
        <dd class="text-sm font-semibold text-gray-900">
          {courseDetails?.creationDate ?? "N/A"}
        </dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-sm font-medium text-gray-500">Código</dt>
        <dd class="text-sm font-semibold text-gray-900">
          {courseDetails?.course?.code ?? "N/A"}
        </dd>
      </div>
    </dl>
  </Card.Content>
</Card.Root>

<Card.Root>
  <Card.Header>
    <Card.Title class="flex items-center gap-2">
      <FileText class="h-5 w-5 text-green-600" />
      Gestión de Sílabo
    </Card.Title>
  </Card.Header>
  <Card.Content>
    {#if courseDetails?.urlSyllabus}
      <p class="mb-4 text-sm text-gray-600">
        Ya existe un sílabo cargado para este curso.
      </p>
      <a
        href={courseDetails?.urlSyllabus}
        target="_blank"
        rel="noopener noreferrer"
        class="mb-3 block w-full"
      >
        <Button class="w-full">
          <Download class="mr-2 h-4 w-4" />
          Ver Sílabo Actual
        </Button>
      </a>
      <Button onclick={handleUploadSyllabus} variant="outline" class="w-full">
        <Upload class="mr-2 h-4 w-4" />
        Reemplazar Sílabo
      </Button>
    {:else}
      <p class="mb-4 text-sm text-gray-600">
        Aún no se ha cargado un sílabo para este curso.
      </p>
      <Button onclick={handleUploadSyllabus} class="w-full">
        <Upload class="mr-2 h-4 w-4" />
        Subir Sílabo
      </Button>
    {/if}
  </Card.Content>
</Card.Root>
