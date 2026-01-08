<script lang="ts">
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { invalidateAll } from "$app/navigation";

  let { teacherId, open = $bindable(false) } = $props<{
    teacherId: string;
    open: boolean;
  }>();

  let deleting = $state(false);

  async function handleDeleteTeacher() {
    deleting = true;
    try {
      const res = await fetch(`/api/teachers/${teacherId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al eliminar profesor");
      }

      toast.success("Profesor eliminado correctamente");
      open = false;
      await invalidateAll();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error desconocido al eliminar profesor");
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
        profesor de nuestros servidores.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Dialog.Close>
        <Button variant="outline">Cancelar</Button>
      </Dialog.Close>
      <Button
        variant="destructive"
        onclick={handleDeleteTeacher}
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
