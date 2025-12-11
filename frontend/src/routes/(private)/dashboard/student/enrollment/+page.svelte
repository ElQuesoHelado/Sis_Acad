<script lang="ts">
	import { studentService } from '$lib/core/services';
	import type {
		StudentCourse,
		AvailableLabGroup,
		LabEnrollmentSelection,
		StudentScheduleEntry
	} from '$lib/core/domain';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as Accordion from '$lib/components/ui/accordion';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import { CircleAlert, LoaderCircle, ListPlus, CircleCheck, TriangleAlert } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { APP_PATHS } from '$lib/utils/app-paths';
	import { cn } from '$lib/utils/cn';

	let allCourses: StudentCourse[] = $state([]);
	let mySchedule: StudentScheduleEntry[] = $state([]);

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

	function timeToMinutes(time: string): number {
		const [h, m] = time.split(':').map(Number);
		return h * 60 + m;
	}

	function checkConflict(group: AvailableLabGroup): boolean {
		for (const labSched of group.schedules) {
			const [startStr, endStr] = labSched.time.split(' - ');
			if (!startStr || !endStr) continue;

			const labStart = timeToMinutes(startStr);
			const labEnd = timeToMinutes(endStr);

			for (const mySched of mySchedule) {
				if (mySched.day.toUpperCase() === labSched.day.toUpperCase()) {
					const myStart = timeToMinutes(mySched.startTime);
					const myEnd = timeToMinutes(mySched.endTime);

					if (labStart < myEnd && labEnd > myStart) {
						return true;
					}
				}
			}
		}
		return false;
	}

	$effect(() => {
		async function loadData() {
			loadingCourses = true;
			error = '';
			try {
				const [coursesRes, scheduleRes] = await Promise.all([
					studentService.getCoursesBySemester('2024-I'),
					studentService.getScheduleBySemester('2024-I')
				]);
				allCourses = coursesRes;
				mySchedule = scheduleRes;
			} catch (err) {
				error = err instanceof Error ? err.message : 'Error al cargar datos';
			} finally {
				loadingCourses = false;
			}
		}
		loadData();
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
			const msg = err instanceof Error ? err.message : 'Error al procesar la matrícula';
			if (msg.includes('conflict') || msg.includes('cruce')) {
				submitError =
					'Conflicto detectado: Uno de los grupos seleccionados se cruza con tu horario.';
			} else {
				submitError = msg;
			}
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
				<LoaderCircle class="text-primary h-12 w-12 animate-spin" />
				<p class="text-muted-foreground">Verificando disponibilidad...</p>
			</div>
		</div>
	{/if}

	{#if error && !loadingCourses}
		<Card class="border-destructive/50 bg-destructive/5">
			<CardContent class="pt-6">
				<div class="flex items-start gap-3">
					<CircleAlert class="text-destructive mt-0.5 h-5 w-5 shrink-0" />
					<div>
						<h3 class="text-destructive mb-1 font-semibold">Error al cargar la página</h3>
						<p class="text-destructive/90 text-sm">{error}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	{#if !loadingCourses && !error}
		{#if loadingGroups}
			<div class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-3">
					<CircleAlert class="text-primary h-12 w-12 animate-spin" />
					<p class="text-muted-foreground">Cargando grupos disponibles...</p>
				</div>
			</div>
		{/if}

		{#if error && !loadingGroups}
			<Card class="border-destructive/50 bg-destructive/5">
				<CardContent class="pt-6">
					<div class="flex items-start gap-3">
						<CircleAlert class="text-destructive mt-0.5 h-5 w-5 shrink-0" />
						<div>
							<h3 class="text-destructive mb-1 font-semibold">Error al cargar grupos</h3>
							<p class="text-destructive/90 text-sm">{error}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		{/if}

		{#if !loadingGroups && !error}
			{#if pendingCourses.length === 0}
				<Card>
					<CardContent class="flex flex-col items-center justify-center py-12">
						<CircleCheck class="mb-4 h-16 w-16 text-green-500" />
						<h3 class="mb-2 text-lg font-semibold">¡Todo listo!</h3>
						<p class="text-muted-foreground text-center">
							No tienes matrículas de laboratorio pendientes.
						</p>
					</CardContent>
				</Card>
			{:else}
				<div class="space-y-4">
					<p class="text-muted-foreground">
						Selecciona un grupo de laboratorio para cada curso.
						<span class="mt-1 block text-xs font-medium text-amber-600"
							>* Los horarios con cruce aparecen deshabilitados.</span
						>
					</p>

					<Accordion.Root class="w-full" type="multiple">
						{#each pendingCourses as course (course.enrollmentId)}
							<Accordion.Item value={course.enrollmentId}>
								<Accordion.Trigger class="text-base hover:no-underline">
									<div class="flex items-center gap-2">
										<span class="font-semibold">{course.courseName}</span>
										<span
											class="bg-muted text-muted-foreground rounded px-2 py-0.5 font-mono text-[10px]"
										>
											{course.courseCode}
										</span>
									</div>
								</Accordion.Trigger>
								<Accordion.Content class="space-y-4 p-4">
									{@const groups = availableGroupsMap.get(course.enrollmentId)}

									{#if !groups}
										<p class="text-destructive text-center text-sm">Error al cargar grupos.</p>
									{:else if groups.length === 0}
										<p class="text-muted-foreground text-center text-sm">
											No hay grupos disponibles.
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
												{@const isConflicting = checkConflict(group)}

												<Label
													for={group.id}
													class={cn(
														'relative flex cursor-pointer items-center justify-between overflow-hidden rounded-md border p-4 transition-colors',
														isConflicting
															? 'bg-muted/20 cursor-not-allowed border-dashed opacity-60'
															: 'hover:bg-accent hover:border-primary/30'
													)}
												>
													<div class="flex items-center gap-3">
														<RadioGroupItem
															value={group.id}
															id={group.id}
															disabled={isConflicting}
														/>

														<div class="flex flex-col">
															<span class="flex items-center gap-2 font-medium">
																Grupo {group.groupLetter}
																{#if isConflicting}
																	<span
																		class="bg-destructive/10 text-destructive flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold"
																	>
																		<TriangleAlert class="h-3 w-3" /> CRUCE
																	</span>
																{/if}
															</span>

															<div class="text-muted-foreground mt-1 space-y-0.5 text-xs">
																{#each group.schedules as sched}
																	<div class="flex items-center gap-2">
																		<span
																			class="w-16 text-[10px] font-semibold uppercase tracking-wider"
																			>{sched.day}</span
																		>
																		<span>{sched.time}</span>
																		<span class="opacity-70">({sched.classroom})</span>
																	</div>
																{:else}
																	<span>Sin horario asignado</span>
																{/each}
															</div>
														</div>
													</div>

													<div class="text-right">
														<div
															class={cn(
																'font-mono text-xs',
																group.currentEnrollment >= group.capacity
																	? 'text-destructive font-bold'
																	: 'text-muted-foreground'
															)}
														>
															{group.currentEnrollment}/{group.capacity}
														</div>
														<div class="text-muted-foreground text-[10px] uppercase">Vacantes</div>
													</div>
												</Label>
											{/each}
										</RadioGroup>
									{/if}
								</Accordion.Content>
							</Accordion.Item>
						{/each}
					</Accordion.Root>

					<div class="flex flex-col items-end gap-3 border-t pt-4">
						<Button
							type="button"
							class="w-full sm:w-auto"
							disabled={submitting || selections.size === 0}
							onclick={handleEnrollmentSubmit}
						>
							{#if submitting}
								<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
								Procesando...
							{:else}
								<ListPlus class="mr-2 h-4 w-4" />
								Confirmar Matrícula ({selections.size})
							{/if}
						</Button>

						{#if submitError}
							<div
								class="text-destructive bg-destructive/10 flex items-center gap-2 rounded px-3 py-2 text-sm"
							>
								<TriangleAlert class="h-4 w-4" />
								{submitError}
							</div>
						{/if}
						{#if submitSuccess}
							<p class="animate-pulse text-sm font-medium text-green-600">
								¡Matrícula guardada con éxito! Redirigiendo...
							</p>
						{/if}
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</div>
