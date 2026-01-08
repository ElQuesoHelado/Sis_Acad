<script lang="ts">
	import { teacherService } from '$lib/core/services';
	import type { TeacherGroup } from '$lib/core/domain/teacher.types';

	type CourseTopic = {
		id: string;
		week: number;
		topicName: string;
		status: 'pendiente' | 'completado';
	};

	import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils/cn';
	import {
		BookOpen,
		Loader2,
		CheckCircle2,
		Circle,
		ArrowRight,
		ListTodo,
		GraduationCap
	} from '@lucide/svelte';
	import { fade } from 'svelte/transition';

	let groups = $state<TeacherGroup[]>([]);
	let selectedGroup = $state<TeacherGroup | null>(null);
	let topics = $state<CourseTopic[]>([]);

	let loadingGroups = $state(true);
	let loadingTopics = $state(false);

	async function loadGroups() {
		try {
			const allGroups = await teacherService.getGroupsBySemester('2025-II');
			groups = allGroups.filter((g) => g.groupType === 'teoria');
		} catch (error) {
			console.error(error);
		} finally {
			loadingGroups = false;
		}
	}
	loadGroups();

	$effect(() => {
		if (selectedGroup) {
			loadTopics(selectedGroup.groupId);
		} else {
			topics = [];
		}
	});

	async function loadTopics(groupId: string) {
		loadingTopics = true;
		try {
			topics = await teacherService.getCourseTopics(groupId);
		} catch (error) {
			console.error(error);
		} finally {
			loadingTopics = false;
		}
	}

	async function toggleTopic(topic: CourseTopic) {
		const oldStatus = topic.status;
		const newStatus = oldStatus === 'completado' ? 'pendiente' : 'completado';

		topic.status = newStatus;

		try {
			await teacherService.updateTopicStatus(topic.id, newStatus);
		} catch (error) {
			topic.status = oldStatus;
			alert('Error de conexión');
		}
	}

	const completedCount = $derived(topics.filter((t) => t.status === 'completado').length);
	const progressPct = $derived(
		topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0
	);
</script>

<div class="animate-in fade-in mx-auto max-w-5xl space-y-8 p-6 duration-500 md:p-10">
	<div
		class="flex flex-col items-start justify-between gap-4 border-b pb-6 md:flex-row md:items-center"
	>
		<div>
			<h1 class="flex items-center gap-2 text-3xl font-bold tracking-tight">
				<ListTodo class="h-8 w-8" /> Avance Silábico
			</h1>
			<p class="text-muted-foreground mt-1">Controla el progreso de tus cursos semana a semana.</p>
		</div>

		<div class="w-full md:w-72">
			<div class="relative">
				<select
					class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full appearance-none items-center justify-between rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					bind:value={selectedGroup}
					disabled={loadingGroups}
				>
					<option value={null} disabled selected>Seleccionar Curso...</option>
					{#each groups as group}
						<option value={group}>{group.courseName} (Grp {group.groupLetter})</option>
					{/each}
				</select>
				<div class="pointer-events-none absolute right-3 top-3 opacity-50">
					<ArrowRight class="h-4 w-4" />
				</div>
			</div>
		</div>
	</div>

	{#if !selectedGroup}
		<div
			class="bg-muted/5 text-muted-foreground flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12"
		>
			<div class="bg-muted/20 rounded-full p-4">
				<GraduationCap class="h-10 w-10 opacity-50" />
			</div>
			<div class="text-center">
				<h3 class="text-foreground text-lg font-semibold">Ningún curso seleccionado</h3>
				<p class="text-sm">Elige un grupo del menú superior para gestionar su contenido.</p>
			</div>
		</div>
	{:else if loadingTopics}
		<div class="flex justify-center p-20">
			<Loader2 class="text-primary h-10 w-10 animate-spin" />
		</div>
	{:else}
		<div transition:fade>
			<Card.Root class="bg-muted/30 mb-8 overflow-hidden border-none shadow-sm">
				<Card.Content class="p-6">
					<div class="mb-2 flex items-end justify-between">
						<div>
							<p class="text-muted-foreground text-sm font-medium uppercase tracking-wider">
								Progreso General
							</p>
							<h2 class="text-foreground mt-1 text-3xl font-bold">{progressPct}%</h2>
						</div>
						<div class="text-right">
							<span class="text-primary font-mono text-2xl font-bold">{completedCount}</span>
							<span class="text-muted-foreground text-sm">/ {topics.length} Temas</span>
						</div>
					</div>

					<div class="bg-muted/50 h-3 w-full overflow-hidden rounded-full">
						<div
							class="bg-primary relative h-full rounded-full transition-all duration-700 ease-out"
							style={`width: ${progressPct}%`}
						>
							<div class="absolute inset-0 animate-pulse bg-white/20"></div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<div class="space-y-4">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
					<BookOpen class="h-5 w-5" /> Temario
				</h3>

				<div class="grid gap-3">
					{#each topics as topic (topic.id)}
						<div
							class={cn(
								'bg-card group flex cursor-pointer select-none items-center gap-4 rounded-lg border p-4 transition-all duration-200 hover:shadow-md',
								topic.status === 'completado'
									? 'border-primary/30 bg-primary/5'
									: 'hover:border-foreground/20'
							)}
							onclick={() => toggleTopic(topic)}
							onkeydown={(e) => e.key === 'Enter' && toggleTopic(topic)}
							role="button"
							tabindex="0"
						>
							<div
								class={cn(
									'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
									topic.status === 'completado'
										? 'bg-primary border-primary text-primary-foreground'
										: 'border-muted-foreground/30 group-hover:border-primary/50'
								)}
							>
								{#if topic.status === 'completado'}
									<CheckCircle2 class="animate-in zoom-in h-4 w-4 duration-200" />
								{:else}
									<Circle class="h-4 w-4 opacity-0" />
								{/if}
							</div>

							<div class="min-w-0 flex-1">
								<div class="mb-0.5 flex items-center gap-2">
									<span
										class="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
									>
										Semana {topic.week}
									</span>
									{#if topic.status === 'completado'}
										<span class="animate-in fade-in text-[10px] font-bold text-green-600">
											COMPLETADO
										</span>
									{/if}
								</div>
								<p
									class={cn(
										'truncate font-medium transition-colors',
										topic.status === 'completado'
											? 'text-muted-foreground decoration-muted-foreground/40 line-through'
											: 'text-foreground'
									)}
								>
									{topic.topicName}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
