<script lang="ts">
    import ScheduleTable from '$lib/components/ScheduleTable.svelte';
    import { CalendarDays } from 'lucide-svelte';
    import { Badge } from '$lib/components/ui/badge';

    let { data } = $props();

    const teacherName = $derived(
        `${data.teacherProfile?.firstName} ${data.teacherProfile?.lastName}`
    );
    console.log("data in schedule page:", data.groups);
    console.log("reserves in schedule page:", data.reserves);
</script>

<div class="container mx-auto space-y-8 p-4 md:p-8">
    <header class="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
        <div class="space-y-1">
            <div class="flex items-center gap-2 text-primary">
                <CalendarDays class="h-8 w-8" />
                <h1 class="text-3xl font-extrabold tracking-tight">Horario Semanal</h1>
            </div>
            <p class="text-lg text-muted-foreground">
                Docente: <span class="font-semibold text-foreground">{teacherName}</span>
            </p>
        </div>
        <Badge variant="outline" class="px-4 py-1 text-sm font-medium">Semestre Actual</Badge>
    </header>

    <section class="rounded-xl border bg-card shadow-sm overflow-hidden p-6">
        <ScheduleTable 
            groups={data.groups} 
            reservations={data.reserves} 
            showCourseName={true} 
        />
    </section>
</div>