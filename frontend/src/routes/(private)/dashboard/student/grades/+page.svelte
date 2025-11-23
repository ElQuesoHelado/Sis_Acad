<script lang="ts">
	import { onMount } from 'svelte';
	import { studentService } from '$lib/core/services/student.service';
	import { type StudentCourseGrades, GradeType } from '$lib/core/domain';

	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import {
		BookOpen,
		User,
		AlertCircle,
		Loader2,
		ChevronDown,
		Award,
		BarChart3
	} from '@lucide/svelte';

	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';

	// Mapeo de nombres amigables para los tipos de nota
	const GradeTypeNames: Record<string, string> = {
		[GradeType.PARTIAL_1]: 'Parcial 1',
		[GradeType.PARTIAL_2]: 'Parcial 2',
		[GradeType.PARTIAL_3]: 'Parcial 3',
		[GradeType.CONTINUOUS_1]: 'Continua 1',
		[GradeType.CONTINUOUS_2]: 'Continua 2',
		[GradeType.CONTINUOUS_3]: 'Continua 3'
	};

	// Estructura combinada para la tabla
	type GradeRow = {
		type: string;
		label: string;
		weight: number;
		studentScore: number | null;
		groupAvg: number | null;
		groupMax: number | null;
		groupMin: number | null;
	};

	let summaries: StudentCourseGrades[] = [];
	let loading = true;
	let error = '';
	let selectedSemester = '2024-I';
	const semesters = ['2025-I', '2024-II', '2024-I', '2023-II', '2023-I'];

	async function loadGrades() {
		loading = true;
		error = '';
		try {
			summaries = await studentService.getGradesBySemester(selectedSemester);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al cargar las notas';
			summaries = [];
		} finally {
			loading = false;
		}
	}

	function statusColor(status: string): string {
		switch (status) {
			case 'Aprobado':
				return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
			case 'Desaprobado':
				return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200';
			case 'En Progreso':
				return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
			default:
				return 'bg-muted text-muted-foreground';
		}
	}

	function handleSemesterChange(semester: string) {
		selectedSemester = semester;
		loadGrades();
	}

	/**
	 * Combina weights, grades y stats en una lista unificada para la tabla.
	 * Usa 'weights' como base porque define la estructura de evaluación del curso.
	 */
	function buildGradeRows(summary: StudentCourseGrades): GradeRow[] {
		if (!summary.weights || summary.weights.length === 0) return [];

		return summary.weights.map((w) => {
			const myGrade = summary.grades.find((g) => g.type === w.type);
			const stat = summary.groupStats.find((s) => s.type === w.type);

			return {
				type: w.type,
				label: GradeTypeNames[w.type] || w.type,
				weight: w.weight,
				studentScore: myGrade ? myGrade.score : null,
				groupAvg: stat ? stat.average : null,
				groupMax: stat ? stat.max : null,
				groupMin: stat ? stat.min : null
			};
		});
	}

	// Cálculos globales para el resumen superior
	$: coursesWithAverage = summaries.filter((s) => s.average !== null);
	$: avgAll =
		coursesWithAverage.length > 0
			? (
					coursesWithAverage.reduce((acc, s) => acc + (s.average ?? 0), 0) /
					coursesWithAverage.length
				).toFixed(2)
			: '-';
	$: passed = summaries.filter((s) => s.status === 'Aprobado').length;
	$: failed = summaries.filter((s) => s.status === 'Desaprobado').length;
	$: inProgress = summaries.filter((s) => s.status === 'En Progreso').length;

	onMount(() => {
		loadGrades();
	});
</script>

<div class="min-h-screen p-6">
	<div class="mx-auto max-w-7xl space-y-6">
		<div class="space-y-2">
			<h1 class="text-3xl font-bold tracking-tight">Mis Calificaciones</h1>
			<p class="text-muted-foreground">
				Seguimiento detallado de rendimiento, promedios y estadísticas grupales.
			</p>
		</div>

		<Card>
			<CardContent class="pt-6">
				<div class="flex items-center gap-4">
					<Label for="semester" class="text-sm font-medium">Semestre:</Label>
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Button variant="outline" class="w-[180px] justify-between">
								{selectedSemester}
								<ChevronDown class="h-4 w-4 opacity-50" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent class="w-[180px]">
							{#each semesters as semester}
								<DropdownMenuItem onclick={() => handleSemesterChange(semester)}>
									{semester}
								</DropdownMenuItem>
							{/each}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardContent>
		</Card>

		{#if loading}
			<div class="flex flex-col items-center justify-center py-12 gap-3">
				<Loader2 class="h-12 w-12 animate-spin text-primary" />
				<p class="text-muted-foreground">Calculando estadísticas...</p>
			</div>
		{/if}

		{#if error && !loading}
			<Card class="border-destructive/50 bg-destructive/5">
				<CardContent class="pt-6 flex items-start gap-3">
					<AlertCircle class="mt-0.5 h-5 w-5 text-destructive shrink-0" />
					<div>
						<h3 class="mb-1 font-semibold text-destructive">Error</h3>
						<p class="text-sm text-destructive/90">{error}</p>
					</div>
				</CardContent>
			</Card>
		{/if}

		{#if !loading && !error}
			{#if summaries.length === 0}
				<Card>
					<CardContent class="flex flex-col items-center justify-center py-12">
						<BookOpen class="mb-4 h-16 w-16 text-muted-foreground" />
						<h3 class="text-lg font-semibold">Sin registros</h3>
						<p class="text-muted-foreground">No hay notas para {selectedSemester}</p>
					</CardContent>
				</Card>
			{:else}
				<Card class="bg-gradient-to-br from-background to-muted/20">
					<CardContent class="pt-6">
						<div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
							<div class="space-y-1">
								<div class="flex items-center justify-center gap-2 text-muted-foreground">
									<Award class="h-4 w-4" />
									<span class="text-sm font-medium">Promedio Ponderado</span>
								</div>
								<p class="text-3xl font-bold tracking-tight">{avgAll}</p>
							</div>
							<div class="space-y-1">
								<span class="text-sm font-medium text-green-600 dark:text-green-400">Aprobados</span>
								<p class="text-3xl font-bold">{passed}</p>
							</div>
							<div class="space-y-1">
								<span class="text-sm font-medium text-red-600 dark:text-red-400">Desaprobados</span>
								<p class="text-3xl font-bold">{failed}</p>
							</div>
							<div class="space-y-1">
								<span class="text-sm font-medium text-blue-600 dark:text-blue-400">En Curso</span>
								<p class="text-3xl font-bold">{inProgress}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
					{#each summaries as summary (summary.enrollmentId)}
						{@const rows = buildGradeRows(summary)}
						
						<Card class="overflow-hidden transition-all hover:shadow-md flex flex-col">
							<CardHeader class="bg-muted/30 border-b pb-4">
								<div class="flex justify-between items-start gap-4">
									<div>
										<CardTitle class="text-lg line-clamp-1" title={summary.courseName}>
											{summary.courseName}
										</CardTitle>
										<div class="flex items-center gap-2 mt-1.5 text-muted-foreground">
											<User class="h-4 w-4" />
											<span class="text-sm">{summary.professorName}</span>
										</div>
									</div>
									<div class="flex flex-col items-end gap-1">
										<span class={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor(summary.status)}`}>
											{summary.status}
										</span>
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
												<th class="text-left px-4 py-3 font-medium">Evaluación</th>
												<th class="text-center px-2 py-3 font-medium w-16">Peso</th>
												<th class="text-center px-2 py-3 font-medium bg-primary/5 text-primary w-20">Nota</th>
												
												<th class="text-center px-2 py-3 font-medium border-l w-20">
													<div class="flex items-center justify-center gap-1" title="Promedio del Grupo">
														<BarChart3 class="h-3 w-3" /> Avg
													</div>
												</th>
												<th class="text-center px-2 py-3 font-medium text-xs text-muted-foreground w-24">
													Rango (Min-Max)
												</th>
											</tr>
										</thead>
										<tbody class="divide-y">
											{#each rows as row}
												<tr class="hover:bg-muted/10 transition-colors">
													<td class="px-4 py-3 font-medium">{row.label}</td>
													<td class="px-2 py-3 text-center text-muted-foreground">
														{row.weight}%
													</td>
													<td class="px-2 py-3 text-center bg-primary/5 font-bold">
														{#if row.studentScore !== null}
															<span class={row.studentScore < 10.5 ? "text-destructive" : "text-primary"}>
																{row.studentScore}
															</span>
														{:else}
															<span class="text-muted-foreground/40">-</span>
														{/if}
													</td>
													
													<td class="px-2 py-3 text-center border-l text-muted-foreground">
														{row.groupAvg !== null ? row.groupAvg.toFixed(1) : '-'}
													</td>
													<td class="px-2 py-3 text-center text-xs text-muted-foreground">
														{#if row.groupMin !== null && row.groupMax !== null}
															<span class="inline-block bg-muted px-1.5 py-0.5 rounded">
																{row.groupMin} - {row.groupMax}
															</span>
														{:else}
															-
														{/if}
													</td>
												</tr>
											{/each}
											
											{#if rows.length === 0}
												<tr>
													<td colspan="5" class="p-8 text-center text-muted-foreground">
														No hay pesos o notas configuradas.
													</td>
												</tr>
											{/if}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>
