<script lang="ts">
  import type { LayoutData } from './$types';

  export let data: LayoutData;
  const { courseDetails } = data;
</script>

<svelte:head>
  <title>Info: {courseDetails?.course?.name || 'Curso'} - Sisacad</title>
</svelte:head>

<div class="bg-white p-6 rounded-lg shadow-md border">
  <h2 class="text-xl font-semibold mb-4 text-gray-700">Información General</h2>

  {#if courseDetails}
    <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div>
        <dt class="text-sm font-medium text-gray-500">Código</dt>
        <dd class="mt-1 text-sm text-gray-900">
          {courseDetails.course?.code || 'N/A'}
        </dd>
      </div>
      <div>
        <dt class="text-sm font-medium text-gray-500">Nombre</dt>
        <dd class="mt-1 text-sm text-gray-900">
          {courseDetails.course?.name || 'N/A'}
        </dd>
      </div>
      <div>
        <dt class="text-sm font-medium text-gray-500">Semestre</dt>
        <dd class="mt-1 text-sm text-gray-900">
          {courseDetails.course?.semester || 'N/A'}
        </dd>
      </div>
      <div>
        <dt class="text-sm font-medium text-gray-500">Créditos</dt>
        <dd class="mt-1 text-sm text-gray-900">
          {courseDetails.course?.credits || 'N/A'}
        </dd>
      </div>
      <div>
        <dt class="text-sm font-medium text-gray-500">Periodo Académico</dt>
        <dd class="mt-1 text-sm text-gray-900">
          {new Date(courseDetails.creationDate).toLocaleDateString()}
        </dd>
      </div>
      {#if courseDetails.coordinator}
        <div>
          <dt class="text-sm font-medium text-gray-500">Coordinador</dt>
          <dd class="mt-1 text-sm text-gray-900">
            {courseDetails.coordinator.firstName}
            {courseDetails.coordinator.lastName}
          </dd>
        </div>
      {/if}
      {#if courseDetails.urlSyllabus}
        <div class="md:col-span-2">
          <dt class="text-sm font-medium text-gray-500">Syllabus</dt>
          <dd class="mt-1 text-sm">
            <a
              href={courseDetails.urlSyllabus}
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline"
            >
              Ver Syllabus (PDF/Link)
            </a>
          </dd>
        </div>
      {/if}
    </dl>
  {:else}
    <p>Cargando detalles del curso...</p>
  {/if}
</div>
