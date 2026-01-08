<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { invalidateAll } from "$app/navigation";
  import { eventService } from "$lib/services/event.service";

  let {
    open = $bindable<boolean>(),
    eventId,
    eventName,
  } = $props<{
    open: boolean;
    eventId: string;
    eventName: string;
  }>();

  async function handleDelete() {
    try {
      await eventService.deleteEvent(eventId);
      open = false;
      await invalidateAll();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event.");
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Are you absolutely sure?</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete the event
        <strong>{eventName}</strong> from our servers.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Dialog.Close>
        <Button variant="ghost">Cancel</Button>
      </Dialog.Close>
      <Button variant="destructive" onclick={handleDelete}>Delete</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
