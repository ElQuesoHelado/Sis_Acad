 <script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { studentService } from '$lib/core/services';
	import type { CourseProgress } from '$lib/core/domain';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { CheckCircle2, Circle, Loader2, BookOpen } from '@lucide/svelte';
	import { AlertCircle } from '@lucide/svelte';

	let enrollmentId = $derived(page.params.enrollmentId);
	let progressData: CourseProgress | null = $state(null);
	let loading = $state(true);
	let error = $state('');

	$effect(() => {
		async function load() {
			loading = true;
			try {
				progressData = await studentService.getCourseProgress(enrollmentId || "");
			} catch (err) {
				error = err instanceof Error ? err.message : 'Error al cargar el sílabo';
			} finally {
				loading = false;
			}
		}
		load();
	});
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">Avance del Curso</h1>
	</div>

	{#if loading}
		<div class="flex justify-center py-12"><Loader2 class="h-10 w-10 animate-spin text-primary"/></div>
	{:else if error}
		<div class="text-destructive flex gap-2"><AlertCircle /> {error}</div>
	{:else if progressData}
		<Card>
			<CardHeader>
				<CardTitle class="flex justify-between">
					<span>Progreso Total</span>
					<span class="text-primary">{progressData.progressPercentage}%</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="h-4 w-full bg-muted rounded-full overflow-hidden">
					<div 
						class="h-full bg-primary transition-all duration-500" 
						style="width: {progressData.progressPercentage}%"
					></div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>Sílabo Semanal</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				{#each progressData.syllabus as topic}
					<div class="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
						<div class="mt-1">
							{#if topic.status === 'completado'}
								<CheckCircle2 class="text-green-500 h-6 w-6" />
							{:else}
								<Circle class="text-muted-foreground h-6 w-6" />
							{/if}
						</div>
						<div>
							<p class="text-xs font-bold text-muted-foreground uppercase">Semana {topic.week}</p>
							<p class="font-medium {topic.status === 'completado' ? 'text-foreground' : 'text-muted-foreground'}">
								{topic.topic}
							</p>
							<span class="text-xs capitalize mt-1 inline-block px-2 py-0.5 rounded-full bg-muted">
								{topic.status}
							</span>
						</div>
					</div>
				{/each}
			</CardContent>
		</Card>
	{/if}
</div>
