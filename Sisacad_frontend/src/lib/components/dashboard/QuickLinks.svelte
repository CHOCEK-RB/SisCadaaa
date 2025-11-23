<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { GraduationCap, Calendar, ListChecks } from "lucide-svelte";
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
  <a href="/student/grades" class="no-underline">
    <Button variant="outline" class="h-24 w-full justify-start p-4 text-left">
      <div class="flex items-center gap-4">
        <GraduationCap class="h-8 w-8 text-primary" />
        <div>
          <h3 class="font-semibold">Mis Calificaciones</h3>
          <p class="text-sm text-muted-foreground">Ver historial de notas.</p>
        </div>
      </div>
    </Button>
  </a>

  <a href="/student/schedule" class="no-underline">
    <Button variant="outline" class="h-24 w-full justify-start p-4 text-left">
      <div class="flex items-center gap-4">
        <Calendar class="h-8 w-8 text-primary" />
        <div>
          <h3 class="font-semibold">Mi Horario</h3>
          <p class="text-sm text-muted-foreground">Consulta tus clases.</p>
        </div>
      </div>
    </Button>
  </a>

  <a href="/student/enrollment" class="no-underline">
    <Button variant="outline" class="h-24 w-full justify-start p-4 text-left">
      <div class="flex items-center gap-4">
        <ListChecks class="h-8 w-8 text-primary" />
        <div>
          <h3 class="font-semibold">Inscripción</h3>
          <p class="text-sm text-muted-foreground">Matricúlate en cursos.</p>
        </div>
      </div>
    </Button>
  </a>
</div>
