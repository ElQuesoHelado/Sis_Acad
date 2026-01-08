<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { adminService } from '$lib/core/services';
	import { APP_PATHS } from '$lib/utils/app-paths';
	import { type StudentCourseGrades, GradeType } from '$lib/core/domain';

	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	
	import { 
		ChevronLeft, 
		Loader2, 
		AlertCircle, 
		ChevronDown, 
		Award, 
		BookOpen, 
		User,
	} from '@lucide/svelte';

	let userId = $derived(page.params.id);
	let summaries: StudentCourseGrades[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	
	const semesters = ['2023-I', '2023-II', '2024-I', '2024-II', '2025-I', '2025-II'];
	let selectedSemester = $state('2025-II');

	const GradeTypeNames: Record<string, string> = {
		[GradeType.PARTIAL_1]: 'Parcial 1',
		[GradeType.PARTIAL_2]: 'Parcial 2',
		[GradeType.PARTIAL_3]: 'Parcial 3',
		[GradeType.CONTINUOUS_1]: 'Continua 1',
		[GradeType.CONTINUOUS_2]: 'Continua 2',
		[GradeType.CONTINUOUS_3]: 'Continua 3'
	};

	const GradeOrder = [
		GradeType.CONTINUOUS_1, GradeType.PARTIAL_1,
		GradeType.CONTINUOUS_2, GradeType.PARTIAL_2,
		GradeType.CONTINUOUS_3, GradeType.PARTIAL_3
	];

	$effect(() => {
		async function load() {
			if (!userId) return;
			loading = true;
			error = '';
			summaries = [];
			try {
				summaries = await adminService.getStudentDetails(userId, selectedSemester);
			} catch (err) {
				error = err instanceof Error ? err.message : 'Error al cargar notas';
			} finally {
				loading = false;
			}
		}
		load();
	});

	function goBack() {
		goto(APP_PATHS.ADMIN.USERS);
	}

	const stats = $derived.by(() => {
		const withAvg = summaries.filter(s => s.average !== null);
		const avg = withAvg.length > 0 
			? (withAvg.reduce((acc, s) => acc + (s.average ?? 0), 0) / withAvg.length).toFixed(2)
			: '-';
		
		return {
			avg,
			passed: summaries.filter(s => s.status === 'Aprobado').length,
			failed: summaries.filter(s => s.status === 'Desaprobado').length,
			inProgress: summaries.filter(s => s.status === 'En Progreso').length
		};
	});

	function buildGradeRows(summary: StudentCourseGrades) {
		if (!summary.weights?.length) return [];
		return summary.weights.map(w => {
			const grade = summary.grades.find(g => g.type === w.type);
			return {
				label: GradeTypeNames[w.type] || w.type,
				weight: w.weight,
				score: grade?.score ?? null,
				type: w.type
			};
		}).sort((a, b) => GradeOrder.indexOf(a.type) - GradeOrder.indexOf(b.type));
	}

	function getStatusColor(status: string) {
		switch(status) {
			case 'Aprobado': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
			case 'Desaprobado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
			default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
		}
	}
</script>

{#snippet title()}
	Detalle Académico - Estudiante
{/snippet}

<div class="mx-auto max-w-7xl space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<Button variant="ghost" class="w-fit pl-0 hover:bg-transparent hover:underline" onclick={goBack}>
			<ChevronLeft class="mr-2 h-4 w-4" />
			Volver al Directorio
		</Button>

		<div class="flex items-center gap-2">
			<span class="text-sm font-medium text-muted-foreground">Semestre:</span>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Button variant="outline" class="w-[140px] justify-between">
						{selectedSemester}
						<ChevronDown class="h-4 w-4 opacity-50" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{#each semesters as semester}
						<DropdownMenuItem onclick={() => selectedSemester = semester}>
							{semester}
						</DropdownMenuItem>
					{/each}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<Loader2 class="h-10 w-10 animate-spin text-primary" />
		</div>
	{:else if error}
		<Card class="border-destructive/50 bg-destructive/5">
			<CardContent class="flex items-center gap-3 pt-6 text-destructive">
				<AlertCircle class="h-5 w-5" />
				<p>{error}</p>
			</CardContent>
		</Card>
	{:else if summaries.length === 0}
		<Card>
			<CardContent class="flex flex-col items-center justify-center py-12 text-muted-foreground">
				<BookOpen class="h-12 w-12 mb-4 opacity-20" />
				<p>No se encontró información académica para este semestre.</p>
			</CardContent>
		</Card>
	{:else}
		<Card class="bg-muted/30">
			<CardContent class="pt-6">
				<div class="grid grid-cols-2 gap-6 text-center md:grid-cols-3">
					<!-- <div class="space-y-1"> -->
					<!-- 	<div class="flex items-center justify-center gap-2 text-muted-foreground"> -->
					<!-- 		<Award class="h-4 w-4" /> -->
					<!-- 		<span class="text-sm font-medium">Promedio Ponderado</span> -->
					<!-- 	</div> -->
					<!-- 	<p class="text-3xl font-bold tracking-tight">{stats.avg}</p> -->
					<!-- </div> -->
					<div class="space-y-1">
						<span class="text-sm font-medium text-green-600 dark:text-green-400">Aprobados</span>
						<p class="text-3xl font-bold">{stats.passed}</p>
					</div>
					<div class="space-y-1">
						<span class="text-sm font-medium text-red-600 dark:text-red-400">Desaprobados</span>
						<p class="text-3xl font-bold">{stats.failed}</p>
					</div>
					<div class="space-y-1">
						<span class="text-sm font-medium text-blue-600 dark:text-blue-400">En Curso</span>
						<p class="text-3xl font-bold">{stats.inProgress}</p>
					</div>
				</div>
			</CardContent>
		</Card>

		<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
			{#each summaries as summary}
				<Card class="flex flex-col overflow-hidden">
					<CardHeader class="border-b bg-muted/20 pb-4">
						<div class="flex items-start justify-between gap-4">
							<div>
								<CardTitle class="line-clamp-1 text-lg">{summary.courseName}</CardTitle>
								<div class="mt-1.5 flex items-center gap-2 text-muted-foreground">
									<User class="h-4 w-4" />
									<span class="text-sm">{summary.professorName}</span>
								</div>
							</div>
							<div class="flex flex-col items-end gap-1">
								<Badge variant="outline" class="{getStatusColor(summary.status)} border-0">
									{summary.status}
								</Badge>
								{#if summary.average !== null}
									<span class="text-lg font-bold text-primary">
										{summary.average.toFixed(2)}
									</span>
								{/if}
							</div>
						</div>
					</CardHeader>
					<CardContent class="p-0 flex-1">
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead class="bg-muted/50 text-muted-foreground">
									<tr>
										<th class="px-4 py-2 text-left font-medium">Evaluación</th>
										<th class="px-4 py-2 text-center font-medium w-20">Peso</th>
										<th class="px-4 py-2 text-center font-medium w-20 bg-primary/5 text-primary">Nota</th>
									</tr>
								</thead>
								<tbody class="divide-y">
									{#each buildGradeRows(summary) as row}
										<tr>
											<td class="px-4 py-2">{row.label}</td>
											<td class="px-4 py-2 text-center text-muted-foreground">{row.weight}%</td>
											<td class="px-4 py-2 text-center font-bold bg-primary/5">
												{#if row.score !== null}
													<span class={row.score < 10.5 ? 'text-destructive' : 'text-foreground'}>
														{row.score}
													</span>
												{:else}
													<span class="text-muted-foreground/40">-</span>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>
