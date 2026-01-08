<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Upload, Download, FileText, Info } from "lucide-svelte";
  import type { AcademicCourseDTO } from "$lib/types/course.types";
  import { academicCourseService } from "$lib/services/academic_course.service";
  import { toast } from "svelte-sonner";

  type Props = {
    courseDetails: AcademicCourseDTO | undefined;
  };

  let { courseDetails }: Props = $props();
  let fileInput: HTMLInputElement | null = null;
  let isUploading = $state(false);

  console.log(courseDetails);
  const MAX_SYLLABUS_SIZE = 5 * 1024 * 1024;

  function handleUploadSyllabus() {
    fileInput?.click();
  }

  function resetFileInput() {
    if (fileInput) {
      fileInput.value = "";
    }
  }

  async function handleFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("El sílabo debe estar en formato PDF.");
      resetFileInput();
      return;
    }

    if (file.size > MAX_SYLLABUS_SIZE) {
      toast.error("El archivo supera el límite de 5 MB.");
      resetFileInput();
      return;
    }

    if (!courseDetails?.id) {
      toast.error("No se pudo identificar el curso.");
      resetFileInput();
      return;
    }

    isUploading = true;
    try {
      const updatedCourse = await academicCourseService.uploadSyllabus(
        courseDetails.id,
        file,
      );
      courseDetails = updatedCourse;
      toast.success("Sílabo cargado correctamente.");
    } catch (error: any) {
      toast.error(
        error?.message || "Ocurrió un error al subir el sílabo.",
      );
    } finally {
      isUploading = false;
      resetFileInput();
    }
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
    {#if !courseDetails?.urlSyllabus}
      <div class="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        Debes subir el sílabo para habilitar el acceso a las funciones del
        curso.
      </div>
    {/if}
    <input
      bind:this={fileInput}
      type="file"
      accept="application/pdf"
      class="hidden"
      onchange={handleFileSelected}
    />
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
      <Button 
        onclick={handleUploadSyllabus}
        variant="outline"
        class="w-full"
        disabled={isUploading}
      >
        <Upload class="mr-2 h-4 w-4" />
        {isUploading ? "Subiendo..." : "Reemplazar Sílabo"}
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
