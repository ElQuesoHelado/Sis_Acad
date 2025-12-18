<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { secretaryService } from '$lib/core/services';
	import { APP_PATHS } from '$lib/utils/app-paths';
	import type { StudentCourseGrades } from '$lib/core/domain';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { ChevronLeft, Loader2, User, CalendarCheck, ChevronRight } from '@lucide/svelte';

	let userId = $derived(page.params.id);
	let courses: StudentCourseGrades[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	const semester = '2024-I';

	$effect(() => {
		async function load() {
			if (!userId) return;
			loading = true;
			try {
				courses = await secretaryService.getStudentDetails(userId, semester);
			} catch (err) {
				error = err instanceof Error ? err.message : 'Error al cargar cursos';
			} finally {
				loading = false;
			}
		}
		load();
	});

	function goBack() {
		goto(APP_PATHS.SECRETARY.STUDENTS);
	}

	function selectCourse(enrollmentId: string) {
		goto(`${APP_PATHS.SECRETARY.STUDENTS}/${userId}/attendance/${enrollmentId}`);
	}
</script>

{#snippet title()}
	Selección de Curso para Asistencia
{/snippet}

<div class="mx-auto max-w-5xl space-y-6">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" onclick={goBack}>
			<ChevronLeft class="h-5 w-5" />
		</Button>
		<div>
			<h2 class="text-2xl font-bold tracking-tight">Consulta de Asistencia</h2>
			<p class="text-muted-foreground">Selecciona un curso para ver el reporte detallado.</p>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<Loader2 class="text-primary h-10 w-10 animate-spin" />
		</div>
	{:else if error}
		<div class="text-destructive py-10 text-center">{error}</div>
	{:else if courses.length === 0}
		<div class="text-muted-foreground py-10 text-center">
			Este estudiante no tiene cursos matriculados.
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2">
			{#each courses as course}
				<Card
					class="hover:border-primary group cursor-pointer transition-colors"
					onclick={() => selectCourse(course.enrollmentId)}
				>
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle class="group-hover:text-primary line-clamp-1 text-base font-medium">
							{course.courseName}
						</CardTitle>
						<CalendarCheck class="text-muted-foreground group-hover:text-primary h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div class="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
							<User class="h-4 w-4" />
							<span>{course.professorName}</span>
						</div>
						<div class="flex items-center justify-between">
							<Badge variant="secondary">Ver Reporte</Badge>
							<ChevronRight class="text-muted-foreground h-4 w-4" />
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>
