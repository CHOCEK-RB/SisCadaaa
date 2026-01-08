<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Upload, Download } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";

  let {
    groupId,
    actionLabel,
    successMessage,
    uploadAction,
    currentUrl = null,
    downloadLabel = "Ver PDF actual",
  } = $props<{
    groupId: string;
    actionLabel: string;
    successMessage: string;
    uploadAction: (groupId: string, formData: FormData) => Promise<void>;
    currentUrl?: string | null;
    downloadLabel?: string;
  }>();

  const maxSizeBytes = 5 * 1024 * 1024;
  const maxSizeLabel = "5 MB";

  let fileInput: HTMLInputElement | null = null;
  let isSaving = $state(false);

  const resolvedUrl = $derived.by(() => {
    if (!currentUrl) return null;
    if (currentUrl.startsWith("http")) return currentUrl;
    if (currentUrl.startsWith("/")) {
      return `/api${currentUrl}`;
    }
    return `/api/${currentUrl}`;
  });

  function resetFileInput() {
    if (fileInput) {
      fileInput.value = "";
    }
  }

  function handleSelectPdf() {
    fileInput?.click();
  }

  function validateFile(file: File): string | null {
    const isPdfMime = file.type === "application/pdf";
    const isPdfName = file.name.toLowerCase().endsWith(".pdf");

    if (!isPdfMime && !isPdfName) {
      return "Solo se permiten archivos PDF.";
    }

    if (file.size > maxSizeBytes) {
      return `El archivo supera el tamaño máximo de ${maxSizeLabel}.`;
    }

    return null;
  }

  async function handleFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
       return;
    }

    const validationError = validateFile(file);
    if (validationError) {      
      toast.error(validationError);
      resetFileInput();
      return;
    }

    isSaving = true;

    try {
      const formData = new FormData();
      formData.append("file", file);

      await uploadAction(groupId, formData);
      await invalidateAll();
      toast.success(successMessage);
      } catch (error: any) {
      toast.error(
        "Error al subir el PDF: " + (error?.message || "Desconocido"),
      );
    } finally {
      isSaving = false;
      resetFileInput();
    }
  }
</script>
<div class="space-y-2">
  <input
    bind:this={fileInput}
    type="file"
    name="file"
    accept="application/pdf"
    class="hidden"
    onchange={handleFileSelected}
  />

  {#if resolvedUrl}
    <a
      href={resolvedUrl}
      target="_blank"
      rel="noopener noreferrer"
      class="block"
    >
      <Button variant="secondary" class="w-full">
        <Download class="mr-2 h-4 w-4" />
        {downloadLabel}
      </Button>
      </a>
  {/if}

  <Button
    type="button"
    variant={resolvedUrl ? "outline" : "default"}
    class="w-full"
    disabled={isSaving}
    onclick={handleSelectPdf}
  >
    <Upload class="mr-2 h-4 w-4" />
    {isSaving ? "Subiendo..." : actionLabel}
  </Button>
  <p class="text-xs text-muted-foreground">
    Solo archivos PDF. Tamaño máximo: {maxSizeLabel}.
  </p>
</div>