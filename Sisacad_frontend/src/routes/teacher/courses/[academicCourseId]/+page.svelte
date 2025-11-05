<script lang="ts">
  import type { CourseTopicDTO } from "$lib/types/course.types";
  import type { LayoutData } from "./$types";
  import { Upload, Download, FileText, ListChecks, Info } from "lucide-svelte";

  let { data } = $props<{ data: LayoutData }>();

  const courseDetails = $derived(data.courseDetails);

  const sortedTopics = $derived(
    courseDetails?.topics?.sort(
      (a: CourseTopicDTO, b: CourseTopicDTO) => a.order - b.order,
    ) ?? [],
  );

  function handleUploadSyllabus() {
    alert(
      "Aquí se implementará la lógica para subir o reemplazar el archivo del sílabo.",
    );
  }
</script>

<svelte:head>
  <title>Información: {courseDetails?.course?.name || "Curso"} - Sisacad</title>
</svelte:head>

<div class="space-y-6">
  <div class="space-y-6 lg:col-span-1">
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2
        class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800"
      >
        <Info class="h-5 w-5 text-blue-600" />
        Detalles
      </h2>
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
            {new Date(courseDetails?.creationDate).getFullYear() ?? "N/A"}
          </dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm font-medium text-gray-500">Código</dt>
          <dd class="text-sm font-semibold text-gray-900">
            {courseDetails?.course?.code ?? "N/A"}
          </dd>
        </div>
      </dl>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2
        class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800"
      >
        <FileText class="h-5 w-5 text-green-600" />
        Gestión de Sílabo
      </h2>

      {#if courseDetails?.urlSyllabus}
        <p class="mb-4 text-sm text-gray-600">
          Ya existe un sílabo cargado para este curso.
        </p>
        <a
          href={courseDetails.urlSyllabus}
          target="_blank"
          rel="noopener noreferrer"
          class="mb-3 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Download class="h-4 w-4" />
          Ver Sílabo Actual
        </a>
        <button
          onclick={handleUploadSyllabus}
          class="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <Upload class="h-4 w-4" />
          Reemplazar Sílabo
        </button>
      {:else}
        <p class="mb-4 text-sm text-gray-600">
          Aún no se ha cargado un sílabo para este curso.
        </p>
        <button
          onclick={handleUploadSyllabus}
          class="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700"
        >
          <Upload class="h-4 w-4" />
          Subir Sílabo
        </button>
      {/if}
    </div>
  </div>

  <div
    class="rounded-lg border border-gray-200 bg-white p-6 pt-20 shadow-sm lg:col-span-2"
  >
    <h2
      class="mb-5 flex items-center gap-2 text-xl font-semibold text-gray-800"
    >
      <ListChecks class="h-6 w-6 text-blue-600" />
      Temario del Curso
    </h2>

    {#if sortedTopics.length > 0}
      <ol class="list-none">
        {#each sortedTopics as topic (topic.id)}
          <li class="flex items-center gap-3 p-2 align-top">
            <div
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700"
            >
              {topic.order}
            </div>
            <div class="flex-1 p-4">
              <p class="text-xl font-medium text-gray-900">{topic.topic}</p>
            </div>
          </li>
        {/each}
      </ol>
    {:else}
      <div class="text-center text-gray-500">
        <p class="mb-2 text-sm">No se han registrado temas para este curso.</p>
        <p class="text-xs">
          (El temario aparecerá aquí una vez que se cargue el sílabo o se
          registren los temas)
        </p>
      </div>
    {/if}
  </div>
</div>
