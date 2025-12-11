<script lang="ts">
	import { teacherService } from '$lib/core/services';
	import type { TeacherGroup } from '$lib/core/domain/teacher.types';
	import HubCard from '$lib/components/common/hub-card.svelte';
	import { Loader2, FileCheck } from '@lucide/svelte';

	let groups = $state<TeacherGroup[]>([]);
	let loading = $state(true);

	let accreditationGroups = $derived(
		groups.filter(g => g.groupType === 'teoria')
	);

	async function loadGroups() {
		try {
			loading = true;
			groups = await teacherService.getGroupsBySemester('2024-I');
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
		}
	}

	loadGroups();
</script>

<div class="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
	
	<div class="border-b pb-6">
		<div class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
			<a href="/dashboard/teacher" class="hover:text-foreground transition-colors">Inicio</a>
			<span class="opacity-50">/</span>
			<span class="text-foreground font-medium">Acreditación</span>
		</div>
		<h1 class="text-3xl font-bold tracking-tight text-foreground">Seleccionar Curso</h1>
		<p class="text-muted-foreground mt-1">Elige un grupo de teoría para gestionar su portafolio de acreditación.</p>
	</div>

	{#if loading}
		<div class="flex justify-center p-20"><Loader2 class="animate-spin w-10 h-10 opacity-50"/></div>
	{:else if accreditationGroups.length === 0}
		<div class="p-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
			<p class="text-muted-foreground">No tienes grupos de teoría asignados este semestre.</p>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each accreditationGroups as group}
				<HubCard 
					item={{
						title: group.courseName,
						description: `Grupo ${group.groupLetter} - Gestión de Portafolio`,
						url: `/dashboard/teacher/accreditation/${group.groupId}`,
						icon: FileCheck,
					}} 
				/>
			{/each}
		</div>
	{/if}
</div>
