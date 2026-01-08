<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { studentService } from '$lib/core/services';
	import type { CourseProgress } from '$lib/core/domain';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { CheckCircle2, Circle, Loader2, BookOpen, FileText } from '@lucide/svelte';
	import { AlertCircle } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let enrollmentId = $derived(page.params.enrollmentId);
	let progressData: CourseProgress | null = $state(null);
	let loading = $state(true);
	let error = $state('');

	$effect(() => {
		async function load() {
			if (!enrollmentId) {
				error = 'ID de matrícula no encontrado en la URL';
				loading = false;
				return;
			}

			loading = true;
			try {
				progressData = await studentService.getCourseProgress(enrollmentId);
			} catch (err) {
				error = err instanceof Error ? err.message : 'Error al cargar el sílabo';
			} finally {
				loading = false;
			}
		}
		load();
	});
</script>

<div class="mx-auto max-w-4xl space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">Avance del Curso</h1>
		{#if progressData?.syllabusUrl}
			<Button variant="outline" href={progressData.syllabusUrl} target="_blank">
				<FileText class="mr-2 h-4 w-4" /> Descargar Sílabo
			</Button>
		{/if}
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<Loader2 class="text-primary h-10 w-10 animate-spin" />
		</div>
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
				<div class="bg-muted h-4 w-full overflow-hidden rounded-full">
					<div
						class="bg-primary h-full transition-all duration-500"
						style="width: {progressData.progressPercentage}%"
					></div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>Sílabo Semanal</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				{#each progressData.syllabus as topic}
					<div class="bg-card/50 flex items-start gap-4 rounded-lg border p-4">
						<div class="mt-1">
							{#if topic.status === 'completado'}
								<CheckCircle2 class="h-6 w-6 text-green-500" />
							{:else}
								<Circle class="text-muted-foreground h-6 w-6" />
							{/if}
						</div>
						<div>
							<p class="text-muted-foreground text-xs font-bold uppercase">Semana {topic.week}</p>
							<p
								class="font-medium {topic.status === 'completado'
									? 'text-foreground'
									: 'text-muted-foreground'}"
							>
								{topic.topic}
							</p>
							<span class="bg-muted mt-1 inline-block rounded-full px-2 py-0.5 text-xs capitalize">
								{topic.status}
							</span>
						</div>
					</div>
				{/each}
			</CardContent>
		</Card>
	{/if}
</div>
