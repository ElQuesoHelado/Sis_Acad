<script lang="ts">
	import { onMount } from 'svelte';
	import { studentService } from '$lib/core/services/student.service';
	import type { StudentCourse } from '$lib/core/domain';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { BookOpen, User, GraduationCap, AlertCircle, Loader2, ChevronDown } from '@lucide/svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';

	let courses: StudentCourse[] = [];
	let loading = true;
	let error = '';
	let selectedSemester = '2024-I';

	const semesters = ['2025-I', '2024-II', '2024-I', '2023-II', '2023-I'];

	async function loadCourses() {
		loading = true;
		error = '';
		try {
			courses = await studentService.getCoursesBySemester(selectedSemester);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al cargar los cursos';
			courses = [];
		} finally {
			loading = false;
		}
	}

	function getLabStatusColor(status: string): string {
		switch (status?.toLowerCase()) {
			case 'matriculado':
				return 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20';
			case 'pendiente':
				return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20';
			case 'no disponible':
				return 'bg-muted text-muted-foreground border border-border';
			default:
				return 'bg-primary/10 text-primary border border-primary/20';
		}
	}

	function handleSemesterChange(semester: string) {
		selectedSemester = semester;
		loadCourses();
	}

	onMount(() => {
		loadCourses();
	});
</script>

<div class="min-h-screen p-6">
	<div class="mx-auto max-w-7xl space-y-6">
		<!-- Header -->
		<div class="space-y-2">
			<h1 class="text-3xl font-bold tracking-tight">Mis Cursos</h1>
			<p class="text-muted-foreground">Consulta los cursos en los que estás matriculado</p>
		</div>

		<!-- Semester Selector Card -->
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

		<!-- Loading State -->
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-3">
					<Loader2 class="h-12 w-12 animate-spin text-primary" />
					<p class="text-muted-foreground">Cargando cursos...</p>
				</div>
			</div>
		{/if}

		<!-- Error State -->
		{#if error && !loading}
			<Card class="border-destructive/50 bg-destructive/5">
				<CardContent class="pt-6">
					<div class="flex items-start gap-3">
						<AlertCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
						<div>
							<h3 class="mb-1 font-semibold text-destructive">Error al cargar los cursos</h3>
							<p class="text-sm text-destructive/90">{error}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		{/if}

		<!-- Courses Grid -->
		{#if !loading && !error}
			{#if courses.length === 0}
				<Card>
					<CardContent class="flex flex-col items-center justify-center py-12">
						<BookOpen class="mb-4 h-16 w-16 text-muted-foreground" />
						<h3 class="mb-2 text-lg font-semibold">No hay cursos registrados</h3>
						<p class="text-center text-muted-foreground">
							No se encontraron cursos para el semestre {selectedSemester}
						</p>
					</CardContent>
				</Card>
			{:else}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each courses as course (course.enrollmentId)}
						<Card class="transition-shadow duration-200 hover:shadow-lg">
							<CardHeader>
								<div class="mb-3 flex items-center justify-between">
									<span
										class="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary"
									>
										{course.courseCode}
									</span>
									<span class="text-sm font-medium text-muted-foreground">
										{course.credits} créditos
									</span>
								</div>
								<CardTitle class="text-lg leading-tight">
									{course.courseName}
								</CardTitle>
							</CardHeader>
							<CardContent class="space-y-4">
								<!-- Professor -->
								<div class="flex items-start gap-2">
									<User class="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
									<p class="text-sm leading-tight text-muted-foreground">
										{course.professorName}
									</p>
								</div>

								<Separator />

								<!-- Lab Status -->
								<div class="flex items-center justify-between">
									<span class="text-xs font-medium text-muted-foreground">
										Estado de Laboratorio:
									</span>
									<span
										class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold {getLabStatusColor(
											course.labStatus
										)}"
									>
										{course.labStatus}
									</span>
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>

				<!-- Summary Card -->
				<Card>
					<CardContent class="pt-6">
						<div class="flex flex-col items-center justify-around gap-6 sm:flex-row">
							<div class="flex items-center gap-4">
								<div class="rounded-lg bg-primary/10 p-3">
									<BookOpen class="h-6 w-6 text-primary" />
								</div>
								<div>
									<p class="text-sm font-medium text-muted-foreground">Total de Cursos</p>
									<p class="text-3xl font-bold">{courses.length}</p>
								</div>
							</div>

							<Separator orientation="vertical" class="hidden h-16 sm:block" />

							<div class="flex items-center gap-4">
								<div class="rounded-lg bg-primary/10 p-3">
									<GraduationCap class="h-6 w-6 text-primary" />
								</div>
								<div>
									<p class="text-sm font-medium text-muted-foreground">Total de Créditos</p>
									<p class="text-3xl font-bold">
										{courses.reduce((sum, c) => sum + c.credits, 0)}
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			{/if}
		{/if}
	</div>
</div>
