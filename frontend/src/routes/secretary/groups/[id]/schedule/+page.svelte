<script lang="ts">
	import type { PageData } from './$types';
	import ScheduleTable from '$lib/components/ScheduleTable.svelte';

	let { data } = $props<{ data: PageData }>();

	const groupSchedules = $derived(data.groupSchedules ?? []);
</script>

<svelte:head>
	<title>Horario del Grupo - Sisacad</title>
</svelte:head>

<div class="space-y-6">
	<h2 class="text-xl font-bold mb-4">Horario del Grupo</h2>
	{#if groupSchedules.length > 0}
		<ScheduleTable groups={groupSchedules} />
	{:else}
		<p class="text-muted-foreground">No hay horario definido para este grupo.</p>
	{/if}
</div>
