<script lang="ts">
	import { teacherService } from '$lib/core/services';
	import {
		GradeType,
		type TeacherGroup,
		type BulkGradeSaveEntry,
		type SaveBulkGradesInput,
		ClassType
	} from '$lib/core/domain';
	import { preventDefault } from '$lib/utils/events';

	import * as Card from '$lib/components/ui/card';
	import * as DDropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Table from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils/cn';

	import Loader2 from '@lucide/svelte/icons/loader-2';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	type EditableStudent = {
		enrollmentId: string;
		studentCode: string;
		name: string;
		surname: string;
		scores: Record<GradeType, number | null>;
	};

	const gradeColumns = [
		{ type: GradeType.PARTIAL_1, label: 'P1' },
		{ type: GradeType.CONTINUOUS_1, label: 'C1' },
		{ type: GradeType.PARTIAL_2, label: 'P2' },
		{ type: GradeType.CONTINUOUS_2, label: 'C2' },
		{ type: GradeType.PARTIAL_3, label: 'P3' },
		{ type: GradeType.CONTINUOUS_3, label: 'C3' }
	];

	const allGradeTypesNull: Record<GradeType, number | null> = {
		[GradeType.PARTIAL_1]: null,
		[GradeType.CONTINUOUS_1]: null,
		[GradeType.PARTIAL_2]: null,
		[GradeType.CONTINUOUS_2]: null,
		[GradeType.PARTIAL_3]: null,
		[GradeType.CONTINUOUS_3]: null
	};

	const semesters = ['2024-I', '2024-II', '2023-II', '2023-I'];
	let selectedSemester = $state('2024-I');

	let groups: TeacherGroup[] = $state([]);
	let selectedGroup: TeacherGroup | null = $state(null);

	let editableRoster: EditableStudent[] = $state([]);

	let loadingGroups = $state(false);
	let loadingRoster = $state(false);
	let isSaving = $state(false);

	let loadError = $state('');
	let saveError = $state('');
	let saveSuccess = $state('');

	// Nuevas estadísticas, solo tras guardar
	let postSaveStats: Record<
		string,
		{ avg: number | null; max: number | null; min: number | null; count: number }
	> | null = $state(null);

	$effect(() => {
		async function loadGroups() {
			if (!selectedSemester) return;
			loadingGroups = true;
			loadError = '';
			selectedGroup = null;
			editableRoster = [];
			groups = [];
			postSaveStats = null;

			try {
				const allGroups = await teacherService.getGroupsBySemester(selectedSemester);
				groups = allGroups.filter((group) => group.groupType === ClassType.THEORY);
			} catch (err) {
				loadError = err instanceof Error ? err.message : 'Error al cargar los grupos';
			} finally {
				loadingGroups = false;
			}
		}
		loadGroups();
	});

	$effect(() => {
		async function loadRoster() {
			if (!selectedGroup) {
				editableRoster = [];
				postSaveStats = null;
				return;
			}

			loadingRoster = true;
			loadError = '';
			editableRoster = [];
			postSaveStats = null;

			try {
				const rosterData = await teacherService.getRosterWithGrades(
					selectedGroup.groupId,
					selectedGroup.groupType
				);

				editableRoster = rosterData.map((student) => {
					const scores: Record<GradeType, number | null> = { ...allGradeTypesNull };
					for (const grade of student.grades) {
						if (grade.type in scores) {
							scores[grade.type] = grade.score;
						}
					}
					return {
						enrollmentId: student.enrollmentId,
						studentCode: student.studentCode,
						name: student.name,
						surname: student.surname,
						scores
					};
				});
			} catch (err) {
				loadError = err instanceof Error ? err.message : 'Error al cargar los estudiantes';
			} finally {
				loadingRoster = false;
			}
		}
		loadRoster();
	});

	async function handleSave() {
		if (!selectedGroup || !editableRoster.length) return;

		isSaving = true;
		saveError = '';
		saveSuccess = '';

		const entries: BulkGradeSaveEntry[] = [];

		for (const student of editableRoster) {
			for (const col of gradeColumns) {
				const score = student.scores[col.type];
				if (score !== null && score !== undefined && !isNaN(score)) {
					entries.push({
						enrollmentId: student.enrollmentId,
						type: col.type,
						score: Number(score)
					});
				}
			}
		}

		const data: SaveBulkGradesInput = {
			groupId: selectedGroup.groupId,
			classType: selectedGroup.groupType,
			entries
		};

		try {
			await teacherService.saveBulkGrades(data);

			// ✅ Recargar roster para obtener datos actualizados desde la API
			await loadRoster(); // Esto actualiza editableRoster con los datos reales del servidor

			// ✅ Calcular estadísticas con los datos recién cargados
			const stats: Record<
				string,
				{ avg: number | null; max: number | null; min: number | null; count: number }
			> = {};

			for (const col of gradeColumns) {
				const validScores = editableRoster
					.map((student) => student.scores[col.type])
					.filter((score): score is number => score !== null && !isNaN(score));

				if (validScores.length === 0) {
					stats[col.label] = { avg: null, max: null, min: null, count: 0 };
					continue;
				}

				const sum = validScores.reduce((acc, s) => acc + s, 0);
				const count = validScores.length;
				const avg = sum / count;
				const max = Math.max(...validScores);
				const min = Math.min(...validScores);

				stats[col.label] = { avg, max, min, count };
			}

			postSaveStats = stats;
			saveSuccess = 'Notas guardadas exitosamente.';
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Error al guardar las notas.';
		} finally {
			isSaving = false;
			setTimeout(() => {
				saveSuccess = '';
				saveError = '';
				// Opcional: mantener las estadísticas visibles más tiempo, o limpiarlas
				// Aquí las dejamos visibles hasta que se cambie de grupo/semestre
			}, 5000);
		}
	}

	const handleSubmit = preventDefault(handleSave);

	// Función auxiliar para recargar roster (usada tras guardar)
	async function loadRoster() {
		if (!selectedGroup) {
			editableRoster = [];
			return;
		}

		loadingRoster = true;
		loadError = '';

		try {
			const rosterData = await teacherService.getRosterWithGrades(
				selectedGroup.groupId,
				selectedGroup.groupType
			);

			editableRoster = rosterData.map((student) => {
				const scores: Record<GradeType, number | null> = { ...allGradeTypesNull };
				for (const grade of student.grades) {
					if (grade.type in scores) {
						scores[grade.type] = grade.score;
					}
				}
				return {
					enrollmentId: student.enrollmentId,
					studentCode: student.studentCode,
					name: student.name,
					surname: student.surname,
					scores
				};
			});
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Error al cargar los estudiantes';
		} finally {
			loadingRoster = false;
		}
	}
</script>

{#snippet title()}
	Ingresar Calificaciones
{/snippet}

<div class="mx-auto grid max-w-full grid-cols-1 gap-6 lg:grid-cols-3">
	<div class="space-y-6 lg:col-span-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Selección de Grupo</Card.Title>
				<Card.Description>
					Elige el semestre y el grupo para el cual deseas registrar las calificaciones.
				</Card.Description>
			</Card.Header>
			<Card.Content class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<DDropdownMenu.Root>
						<DDropdownMenu.Trigger
							class={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between')}
						>
							{selectedSemester}
							<ChevronDown class="h-4 w-4 opacity-50" />
						</DDropdownMenu.Trigger>
						<DDropdownMenu.Content class="w-(--radix-dropdown-menu-trigger-width)">
							{#each semesters as semester}
								<DDropdownMenu.Item onclick={() => (selectedSemester = semester)}>
									{semester}
								</DDropdownMenu.Item>
							{/each}
						</DDropdownMenu.Content>
					</DDropdownMenu.Root>
				</div>

				<div>
					<DDropdownMenu.Root>
						<DDropdownMenu.Trigger
							class={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between')}
							disabled={loadingGroups || groups.length === 0}
						>
							{#if loadingGroups}
								<Loader2 class="h-4 w-4 animate-spin" />
							{:else if selectedGroup}
								<span class="truncate">
									{selectedGroup.courseName} ({selectedGroup.groupType}
									{selectedGroup.groupLetter})
								</span>
							{:else}
								Seleccionar Grupo
							{/if}
							<ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
						</DDropdownMenu.Trigger>
						<DDropdownMenu.Content class="w-(--radix-dropdown-menu-trigger-width)">
							{#if groups.length > 0}
								{#each groups as group}
									<DDropdownMenu.Item onclick={() => (selectedGroup = group)}>
										{group.courseName} ({group.groupType}
										{group.groupLetter})
									</DDropdownMenu.Item>
								{/each}
							{:else if !loadingGroups}
								<DDropdownMenu.Item disabled
									>No hay grupos de teoría este semestre</DDropdownMenu.Item
								>
							{/if}
						</DDropdownMenu.Content>
					</DDropdownMenu.Root>
				</div>
			</Card.Content>
		</Card.Root>

		{#if loadError}
			<Card.Root class="border-destructive/50 bg-destructive/5">
				<Card.Content class="pt-6">
					<div class="flex items-start gap-3">
						<AlertCircle class="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
						<div>
							<h3 class="mb-1 font-semibold text-destructive">Error al cargar</h3>
							<p class="text-sm text-destructive/90">{loadError}</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/if}

		{#if loadingRoster}
			<div class="flex flex-col items-center justify-center py-12">
				<Loader2 class="h-12 w-12 animate-spin text-primary" />
				<p class="mt-4 text-muted-foreground">Cargando estudiantes...</p>
			</div>
		{/if}

		{#if editableRoster.length > 0 && !loadingRoster}
			<form onsubmit={handleSubmit}>
				<Card.Root>
					<Card.Header>
						<Card.Title>Registro de Notas</Card.Title>
						<Card.Description>
							Ingresa las notas de 0 a 20. Los campos vacíos no se guardarán.
						</Card.Description>
					</Card.Header>
					<Card.Content class="overflow-x-auto">
						<Table.Root>
							<Table.Header class="sticky top-0 bg-muted/80 backdrop-blur-sm">
								<Table.Row>
									<Table.Head class="min-w-[100px]">Código</Table.Head>
									<Table.Head class="min-w-[250px]">Estudiante</Table.Head>
									{#each gradeColumns as col}
										<Table.Head class="w-[100px] text-center">{col.label}</Table.Head>
									{/each}
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each editableRoster as student (student.enrollmentId)}
									<Table.Row>
										<Table.Cell class="font-mono">{student.studentCode}</Table.Cell>
										<Table.Cell class="font-medium whitespace-nowrap">
											{student.surname}, {student.name}
										</Table.Cell>

										{#each gradeColumns as col (col.type)}
											<Table.Cell>
												<Input
													type="number"
													min="0"
													max="20"
													step="0.5"
													class="text-center"
													placeholder="-"
													value={student.scores[col.type]}
													oninput={(e) => {
														const val = e.currentTarget.valueAsNumber;
														student.scores[col.type] = isNaN(val) ? null : val;
														// Disparar reactividad
														editableRoster = [...editableRoster];
													}}
												/>
											</Table.Cell>
										{/each}
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
					<Card.Footer
						class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
					>
						<Button type="submit" disabled={isSaving}>
							{#if isSaving}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Guardando...
							{:else}
								Guardar Cambios
							{/if}
						</Button>

						{#if saveSuccess}
							<div class="flex items-center gap-2 text-sm text-green-600">
								<CheckCircle class="h-4 w-4" />
								{saveSuccess}
							</div>
						{/if}
						{#if saveError}
							<div class="flex items-center gap-2 text-sm text-destructive">
								<AlertCircle class="h-4 w-4" />
								{saveError}
							</div>
						{/if}
					</Card.Footer>
				</Card.Root>
			</form>
		{/if}
	</div>

	<!-- Panel de estadísticas (solo tras guardar) -->
	<div class="space-y-6 lg:col-span-1">
		<div class="lg:sticky lg:top-24">
			{#if postSaveStats}
				<Card.Root>
					<Card.Header>
						<Card.Title>Estadísticas</Card.Title>
						<Card.Description>Calculadas tras guardar las notas.</Card.Description>
					</Card.Header>
					<Card.Content class="grid grid-cols-2 gap-4">
						{#each Object.entries(postSaveStats) as [label, stats]}
							<div class="rounded-lg border bg-muted/50 p-4 text-center">
								<h4 class="text-sm font-semibold text-muted-foreground">{label}</h4>
								{#if stats.count > 0}
									<div class="mt-2 space-y-1">
										<p class="text-lg font-bold text-primary">{stats.avg?.toFixed(2)}</p>
										<p class="text-xs text-muted-foreground">Promedio</p>
										<div class="flex justify-around pt-1 text-xs">
											<div>
												<span class="font-medium">{stats.max}</span>
												<span class="block text-muted-foreground">Max</span>
											</div>
											<div>
												<span class="font-medium">{stats.min}</span>
												<span class="block text-muted-foreground">Min</span>
											</div>
										</div>
									</div>
								{:else}
									<p class="mt-4 pt-8 text-sm text-muted-foreground">-</p>
								{/if}
							</div>
						{/each}
					</Card.Content>
				</Card.Root>
			{:else if !loadingRoster && !loadingGroups}
				<Card.Root>
					<Card.Header>
						<Card.Title>Estadísticas</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="text-sm text-muted-foreground">Guarda las notas para ver las estadísticas.</p>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	</div>
</div>
