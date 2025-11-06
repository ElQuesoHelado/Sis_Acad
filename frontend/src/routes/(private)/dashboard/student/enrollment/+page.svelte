<script lang="ts">
	import { studentService } from '$lib/core/services';
	import type { StudentCourse, AvailableLabGroup, LabEnrollmentSelection } from '$lib/core/domain';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as Accordion from '$lib/components/ui/accordion';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import { CircleAlert, LoaderCircle, ListPlus, CircleCheck } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { APP_PATHS } from '$lib/utils/app-paths';

	let allCourses: StudentCourse[] = $state([]);
	let loadingCourses = $state(true);
	let loadingGroups = $state(false);
	let error = $state('');
	let submitting = $state(false);
	let submitError = $state('');
	let submitSuccess = $state(false);

	let availableGroupsMap = $state(new Map<string, AvailableLabGroup[]>());
	let selections = $state(new Map<string, string>());

	const pendingCourses = $derived(
		allCourses.filter((c) => c.labStatus.toLowerCase() === 'sin matricula')
	);

	$effect(() => {
		async function loadCourses() {
			loadingCourses = true;
			error = '';
			try {
				allCourses = await studentService.getCoursesBySemester('2024-I');
			} catch (err) {
				error = err instanceof Error ? err.message : 'Error al cargar los cursos';
			} finally {
				loadingCourses = false;
			}
		}
		loadCourses();
	});

	$effect(() => {
		async function loadAllAvailableGroups() {
			const coursesToFetch = pendingCourses;
			if (coursesToFetch.length === 0) {
				loadingGroups = false;
				return;
			}

			loadingGroups = true;
			const newMap = new Map<string, AvailableLabGroup[]>();

			try {
				const promises = coursesToFetch.map(async (course) => {
					const groups = await studentService.getAvailableLabGroups(course.enrollmentId);
					return { enrollmentId: course.enrollmentId, groups };
				});

				const results = await Promise.all(promises);

				for (const result of results) {
					newMap.set(result.enrollmentId, result.groups);
				}
				availableGroupsMap = newMap;
			} catch (err) {
				error = err instanceof Error ? err.message : 'Error al cargar los grupos de laboratorio';
			} finally {
				loadingGroups = false;
			}
		}

		if (!loadingCourses) {
			loadAllAvailableGroups();
		}
	});

	async function handleEnrollmentSubmit() {
		submitting = true;
		submitError = '';
		submitSuccess = false;

		const selectionsArray: LabEnrollmentSelection[] = [];
		for (const [enrollmentId, labGroupId] of selections.entries()) {
			selectionsArray.push({ enrollmentId, labGroupId });
		}

		if (selectionsArray.length === 0) {
			submitError = 'No has seleccionado ningún grupo.';
			submitting = false;
			return;
		}

		try {
			await studentService.enrollInLabGroups({ selections: selectionsArray });
			submitSuccess = true;

			setTimeout(() => {
				goto(APP_PATHS.STUDENT.COURSES, { invalidateAll: true });
			}, 2000);
		} catch (err) {
			submitError = err instanceof Error ? err.message : 'Error al procesar la matrícula';
		} finally {
			submitting = false;
		}
	}
</script>

{#snippet title()}Matrícula de Laboratorio{/snippet}

<div class="mx-auto max-w-4xl space-y-6">
	{#if loadingCourses}
		<div class="flex items-center justify-center py-12">
			<div class="flex flex-col items-center gap-3">
				<LoaderCircle class="h-12 w-12 animate-spin text-primary" />
				<p class="text-muted-foreground">Buscando cursos pendientes...</p>
			</div>
		</div>
	{/if}

	{#if error && !loadingCourses}
		<Card class="border-destructive/50 bg-destructive/5">
			<CardContent class="pt-6">
				<div class="flex items-start gap-3">
					<CircleAlert class="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
					<div>
						<h3 class="mb-1 font-semibold text-destructive">Error al cargar la página</h3>
						<p class="text-sm text-destructive/90">{error}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	{#if !loadingCourses && !error}
		{#if loadingGroups}
			<div class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-3">
					<CircleAlert class="h-12 w-12 animate-spin text-primary" />
					<p class="text-muted-foreground">Cargando grupos disponibles...</p>
				</div>
			</div>
		{/if}

		{#if error && !loadingGroups}
			<Card class="border-destructive/50 bg-destructive/5">
				<CardContent class="pt-6">
					<div class="flex items-start gap-3">
						<CircleAlert class="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
						<div>
							<h3 class="mb-1 font-semibold text-destructive">Error al cargar grupos</h3>
							<p class="text-sm text-destructive/90">{error}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		{/if}

		{#if !loadingGroups && !error}
			{#if pendingCourses.length === 0}
				<Card>
					<CardContent class="flex flex-col items-center justify-center py-12">
						<CircleAlert class="mb-4 h-16 w-16 text-green-500" />
						<h3 class="mb-2 text-lg font-semibold">¡Todo listo!</h3>
						<p class="text-center text-muted-foreground">
							No tienes matrículas de laboratorio pendientes.
						</p>
					</CardContent>
				</Card>
			{:else}
				<div class="space-y-4">
					<p class="text-muted-foreground">
						Selecciona un grupo de laboratorio para cada curso pendiente.
					</p>

					<Accordion.Root class="w-full" type="multiple">
						{#each pendingCourses as course (course.enrollmentId)}
							<Accordion.Item value={course.enrollmentId}>
								<Accordion.Trigger class="text-base">
									{course.courseName}
									<span
										class="mr-4 ml-auto rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
									>
										{course.courseCode}
									</span>
								</Accordion.Trigger>
								<Accordion.Content class="space-y-4 p-4">
									{@const groups = availableGroupsMap.get(course.enrollmentId)}

									{#if !groups}
										<p class="text-center text-sm text-destructive">
											Error al cargar grupos para este curso.
										</p>
									{:else if groups.length === 0}
										<p class="text-center text-sm text-muted-foreground">
											No hay grupos de laboratorio disponibles para este curso.
										</p>
									{:else}
										<RadioGroup
											class="space-y-3"
											onValueChange={(value) => {
												if (value) {
													const newMap = new Map(selections);
													newMap.set(course.enrollmentId, value);
													selections = newMap;
												}
											}}
										>
											{#each groups as group}
												<Label
													for={group.id}
													class="flex cursor-pointer items-center justify-between rounded-md border p-4 hover:bg-accent"
												>
													<div class="flex items-center gap-3">
														<!-- El 'value' del item es el 'labGroupId' -->
														<RadioGroupItem value={group.id} id={group.id} />
														<span class="font-medium">Grupo {group.groupLetter}</span>
													</div>
												</Label>
											{/each}
										</RadioGroup>
									{/if}
								</Accordion.Content>
							</Accordion.Item>
						{/each}
					</Accordion.Root>

					<div class="flex flex-col items-end gap-3 pt-4">
						<Button
							type="button"
							class="w-full sm:w-auto"
							disabled={submitting || selections.size === 0}
							onclick={handleEnrollmentSubmit}
						>
							{#if submitting}
								<CircleCheck class="mr-2 h-4 w-4 animate-spin" />
								Guardando...
							{:else}
								<ListPlus class="mr-2 h-4 w-4" />
								Guardar Matrículas ({selections.size})
							{/if}
						</Button>

						{#if submitError}
							<p class="text-sm text-destructive">{submitError}</p>
						{/if}
						{#if submitSuccess}
							<p class="text-sm text-green-600">¡Matrícula guardada con éxito! Redirigiendo...</p>
						{/if}
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</div>
