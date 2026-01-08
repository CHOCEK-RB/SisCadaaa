<script lang="ts">
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
  import * as Sheet from "$lib/components/ui/sheet";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type { TeacherUserDTO } from "./teacher-columns";
  import * as Select from "$lib/components/ui/select";
  import { invalidateAll } from "$app/navigation";

  let { teacher, open = $bindable(false) } = $props<{
    teacher: TeacherUserDTO;
    open: boolean;
  }>();

  let updating = $state(false);

  let email = $state(teacher.email);
  let firstName = $state(teacher.firstName);
  let lastName = $state(teacher.lastName);
  let isActiveString = $state(teacher.isActive ? "true" : "false");

  async function handleUpdateTeacher(event: Event) {
    event.preventDefault();
    updating = true;
    try {
      const [firstLastName, secondLastName] = lastName.split(" ");

      const res = await fetch(`/api/teachers/${teacher.userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: firstName,
          firstLastName: firstLastName ?? "",
          secondLastName: secondLastName ?? "",
          isActive: isActiveString === "true",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar profesor");
      }

      toast.success("Profesor actualizado correctamente");
      await invalidateAll();
      open = false;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error desconocido al actualizar profesor");
      }
    } finally {
      updating = false;
    }
  }
</script>

<Sheet.Root bind:open>
  <Sheet.Content class="sm:max-w-[425px]">
    <form onsubmit={handleUpdateTeacher}>
      <Sheet.Header>
        <Sheet.Title>Editar Profesor</Sheet.Title>
        <Sheet.Description>
          Realiza cambios en la información del profesor aquí. Haz clic en
          guardar cuando hayas terminado.
        </Sheet.Description>
      </Sheet.Header>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="email" class="text-right">Email</Label>
          <Input id="email" bind:value={email} class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="name" class="text-right">Nombre</Label>
          <Input id="name" bind:value={firstName} class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="lastName" class="text-right">Apellidos</Label>
          <Input id="lastName" bind:value={lastName} class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="isActive" class="text-right">Activo</Label>
          <div class="col-span-3">
            <Select.Root
              type="single"
              bind:value={isActiveString}
              onValueChange={(value: string | undefined) => {
                if (value) isActiveString = value;
              }}
            >
              <Select.Trigger class="w-full">
                {isActiveString === "true" ? "Sí" : "No"}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="true">Sí</Select.Item>
                <Select.Item value="false">No</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        </div>
      </div>
      <Sheet.Footer>
        <Sheet.Close>
          <Button variant="outline">Cancelar</Button>
        </Sheet.Close>
        <Button type="submit" disabled={updating}>
          {#if updating}
            Guardando...
          {:else}
            Guardar cambios
          {/if}
        </Button>
      </Sheet.Footer>
    </form>
  </Sheet.Content>
</Sheet.Root>
