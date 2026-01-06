<script lang="ts">
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";

  let { studentId, open = $bindable(false) } = $props<{
    studentId: string;
    open: boolean;
  }>();

  let deleting = $state(false);

  async function handleDeleteStudent() {
    deleting = true;
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al eliminar estudiante");
      }

      toast.success("Estudiante eliminado correctamente");
      open = false;
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error desconocido al eliminar estudiante");
      }
    } finally {
      deleting = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>¿Estás absolutamente seguro?</Dialog.Title>
      <Dialog.Description>
        Esta acción no se puede deshacer. Esto eliminará permanentemente al
        estudiante de nuestros servidores.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Dialog.Close>
        <Button variant="outline">Cancelar</Button>
      </Dialog.Close>
      <Button
        variant="destructive"
        onclick={handleDeleteStudent}
        disabled={deleting}
      >
        {#if deleting}
          Eliminando...
        {:else}
          Eliminar
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
