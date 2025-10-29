<script lang="ts">
  import type { PageData } from './$types';
  import { CheckCircle, XCircle, Percent } from 'lucide-svelte'; // Iconos

  export let data: PageData;
  const attendanceData = data.attendanceData ?? [];
  const errorMessage = data.error;

  function getStatusClass(status: string | undefined | null): string {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'text-green-600 bg-green-100';
      case 'absent':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  function capitalize(str: string | undefined | null): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  function formatDate(isoString: string | undefined | null): string {
    if (!isoString) return 'Fecha inválida';
    try {
      return new Date(isoString).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return `Fecha inválida: ${error}`;
    }
  }
</script>

<svelte:head>
  <title>Mi Asistencia - Sisacad</title>
</svelte:head>

<div class="space-y-8">
  {#if errorMessage}
    <div
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{errorMessage}</span>
    </div>
  {:else if attendanceData.length > 0}
    <!-- Mostrar datos si no hay error y hay datos -->
    {#each attendanceData as groupAttendance (groupAttendance.groupId)}
      <div
        class="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200"
      >
        <h2 class="text-xl font-semibold mb-4 text-gray-800">
          Asistencia - {capitalize(groupAttendance.groupType)} ({groupAttendance.groupName})
        </h2>

        <!-- Resumen -->
        <div class="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div class="p-3 bg-gray-50 rounded-md border">
            <p class="text-xs sm:text-sm text-gray-500">Clases</p>
            <p class="text-lg font-bold text-gray-800">
              {groupAttendance.totalClasses}
            </p>
          </div>
          <div class="p-3 bg-green-50 rounded-md border border-green-200">
            <p class="text-xs sm:text-sm text-green-700">Presente</p>
            <p class="text-lg font-bold text-green-800">
              {groupAttendance.presentCount}
            </p>
          </div>
          <div class="p-3 bg-red-50 rounded-md border border-red-200">
            <p class="text-xs sm:text-sm text-red-700">Ausente</p>
            <p class="text-lg font-bold text-red-800">
              {groupAttendance.absentCount}
            </p>
          </div>
          <div class="p-3 bg-blue-50 rounded-md border border-blue-200">
            <p class="text-xs sm:text-sm text-blue-700">Asistencia</p>
            <p
              class="text-lg font-bold text-blue-800 flex items-center justify-center"
            >
              {groupAttendance.attendancePercentage}<Percent
                class="w-4 h-4 ml-1 inline"
              />
            </p>
          </div>
        </div>

        <!-- Tabla de Registros -->
        {#if groupAttendance.records.length > 0}
          <div class="overflow-x-auto border rounded-md">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha de Clase
                  </th>
                  <th
                    scope="col"
                    class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each groupAttendance.records as record (record.classDate)}
                  <tr>
                    <td
                      class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {formatDate(record.classDate)}
                    </td>
                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        class="px-2.5 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full {getStatusClass(
                          record.status,
                        )}"
                      >
                        {#if record.status === 'present'}
                          <CheckCircle class="w-3 h-3 mr-1" />
                        {:else if record.status === 'absent'}
                          <XCircle class="w-3 h-3 mr-1" />
                        {/if}
                        {capitalize(record.status)}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="text-center text-gray-500 py-4 italic">
            No hay registros detallados de asistencia para este grupo.
          </p>
        {/if}
      </div>
    {/each}
  {:else}
    <!-- Mostrar si no hay error pero tampoco hay datos -->
    <div class="bg-white p-6 rounded-lg shadow-md border text-center">
      <p class="text-gray-600">
        No se encontraron datos de asistencia para este curso o aún no se han
        registrado clases.
      </p>
    </div>
  {/if}
</div>
