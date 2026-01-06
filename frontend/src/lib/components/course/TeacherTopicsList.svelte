<script lang="ts">
  import type { CourseTopicDTO } from "$lib/types/course.types";
  import { ListChecks } from "lucide-svelte";
  import * as Field from "$lib/components/ui/field";
  import * as Form from "$lib/components/ui/form";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import CourseProgressBar from "./CourseProgressBar.svelte";
  import type { SuperForm, Infer } from "sveltekit-superforms";
  import type { UpdateTopicsSchema } from "../../../routes/teacher/courses/[academicCourseId]/groups/[academicGroupId]/topics-schema";

  type Props = {
    topics: CourseTopicDTO[];
    form: SuperForm<Infer<UpdateTopicsSchema>>;
  };

  let { topics, form }: Props = $props();

  const { form: formData, enhance } = form;

  const completedTopicsSet = $derived(new Set($formData.completedTopics));

  function addItem(id: string) {
    $formData.completedTopics = [...$formData.completedTopics, id];
  }

  function removeItem(id: string) {
    $formData.completedTopics = $formData.completedTopics.filter(
      (i) => i !== id,
    );
  }

  const progressPercentage = $derived(
    topics.length > 0 ? (completedTopicsSet.size / topics.length) * 100 : 0,
  );
</script>

<form method="POST" use:enhance>
  <Field.Group>
    <Field.Set>
      <Field.Label class="flex items-center gap-2 text-lg font-semibold">
        <ListChecks class="h-6 w-6 text-blue-600" />
        Temario del Curso
      </Field.Label>
      <Field.Description>
        Selecciona los temas que ya han sido cubiertos en clase.
      </Field.Description>

      <input type="hidden" name="groupName" bind:value={$formData.groupName} />

      {#if topics.length > 0}
        <div class="my-4">
          <CourseProgressBar percentage={progressPercentage} />
        </div>

        <div class="mt-4 space-y-2">
          <Form.Fieldset {form} name="completedTopics" class="space-y-0">
            {#each topics as topic (topic.id)}
              {@const checked = completedTopicsSet.has(topic.id)}
              <Field.Label
                for={topic.id}
                class="block cursor-pointer rounded-lg border p-1 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Field.Field orientation="horizontal" class="p-2">
                  <div
                    class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700"
                  >
                    {topic.order}
                  </div>
                  <Field.Content class="pl-4">
                    <Field.Title>{topic.topic}</Field.Title>
                  </Field.Content>
                  <Form.Control>
                    {#snippet children({ props })}
                      <Checkbox
                        {...props}
                        id={topic.id}
                        {checked}
                        value={topic.id}
                        onCheckedChange={(v) => {
                          if (v) {
                            addItem(topic.id);
                          } else {
                            removeItem(topic.id);
                          }
                        }}
                      />
                    {/snippet}
                  </Form.Control>
                </Field.Field>
              </Field.Label>
            {/each}
            <Form.FieldErrors />
          </Form.Fieldset>
        </div>

        <div class="mt-6 flex justify-end">
          <Form.Button type="submit">Guardar Cambios</Form.Button>
        </div>
      {:else}
        <div class="mt-6 text-center text-gray-500">
          <p class="mb-2 text-sm">
            No se han registrado temas para este curso.
          </p>
          <p class="text-xs">
            (El temario aparecerá aquí una vez que se cargue el sílabo o se
            registren los temas)
          </p>
        </div>
      {/if}
    </Field.Set>
  </Field.Group>
</form>
