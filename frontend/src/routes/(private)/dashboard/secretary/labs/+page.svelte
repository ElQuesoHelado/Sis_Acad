<script lang="ts">
	import { onMount } from 'svelte';
	import { secretaryService } from '$lib/core/services/secretary.service';
	import { classroomService } from '$lib/core/services/classroom.service';
	import type {
		LabGroup,
		AdminUserListEntry,
		CourseSummary,
		CreateLabScheduleEntry
	} from '$lib/core/domain/admin.types';
	import type { Classroom } from '$lib/core/domain/classroom.types';
	import { DayOfWeek } from '$lib/core/domain/enums';

	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Plus,
		FlaskConical,
		LoaderCircle,
		Pencil,
		Clock,
		MapPin,
		Trash2,
		CalendarDays
	} from '@lucide/svelte';
	import * as Select from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';

	const timeSlots = [
		'07:00',
		'08:00',
		'09:00',
		'10:00',
		'11:00',
		'12:00',
		'13:00',
		'14:00',
		'15:00',
		'16:00',
		'17:00',
		'18:00',
		'19:00',
		'20:00',
		'21:00'
	];

	const days = Object.values(DayOfWeek);

	let labs: LabGroup[] = [];
	let teachers: AdminUserListEntry[] = [];
	let courses: CourseSummary[] = [];
	let classrooms: Classroom[] = [];
	let isLoading = true;

	let isCreateSheetOpen = false;
	let isCreating = false;

	let createForm = {
		courseId: '',
		professorId: '',
		groupLetter: '',
		capacity: '20',
		semester: '2025-II',
		schedules: [] as CreateLabScheduleEntry[]
	};

	let selectedCourseLabel = 'Seleccionar asignatura';
	let selectedProfessorLabel = 'Seleccionar docente';

	let isEditOpen = false;
	let isUpdating = false;
	let editForm = {
		labId: '',
		currentCapacity: '0',
		newCapacity: '0'
	};

	async function loadData() {
		isLoading = true;
		try {
			const [labsData, teachersData, coursesData, classroomsData] = await Promise.all([
				secretaryService.getLabs(),
				secretaryService.getTeachers(),
				secretaryService.getCourses(),
				classroomService.getAllClassrooms()
			]);
			labs = labsData;
			teachers = teachersData;
			courses = coursesData.filter((c) => c.type === 'labo' || c.type === 'teoria_labo');
			classrooms = classroomsData;
		} catch (error) {
			console.error('Error cargando datos:', error);
		} finally {
			isLoading = false;
		}
	}

	function addScheduleSlot() {
		createForm.schedules = [
			...createForm.schedules,
			{ day: '', startTime: '', endTime: '', classroomId: '' }
		];
	}

	function removeScheduleSlot(index: number) {
		createForm.schedules = createForm.schedules.filter((_, i) => i !== index);
	}

	function updateSchedule(index: number, field: keyof CreateLabScheduleEntry, value: string) {
		createForm.schedules[index] = { ...createForm.schedules[index], [field]: value };
	}

	async function handleCreateLab() {
		if (!createForm.courseId || !createForm.professorId || !createForm.groupLetter) {
			alert('Por favor completa la información general.');
			return;
		}

		if (createForm.schedules.length === 0) {
			alert('Debes agregar al menos un horario.');
			return;
		}

		for (const s of createForm.schedules) {
			if (!s.day || !s.startTime || !s.endTime || !s.classroomId) {
				alert('Por favor completa todos los campos de los horarios.');
				return;
			}
			if (s.startTime >= s.endTime) {
				alert(`Horario inválido en ${s.day}: El inicio debe ser antes del fin.`);
				return;
			}
		}

		isCreating = true;
		try {
			await secretaryService.createLab({
				courseId: createForm.courseId,
				professorId: createForm.professorId,
				groupLetter: createForm.groupLetter.toUpperCase(),
				capacity: String(createForm.capacity),
				semester: createForm.semester,
				schedules: createForm.schedules
			});
			isCreateSheetOpen = false;
			resetCreateForm();
			await loadData();
		} catch (error) {
			console.error('Error creando lab:', error);
			alert('Error al crear. Verifica conflictos de horario.');
		} finally {
			isCreating = false;
		}
	}

	function resetCreateForm() {
		createForm = {
			courseId: '',
			professorId: '',
			groupLetter: '',
			capacity: '20',
			semester: '2025-II',
			schedules: []
		};
		addScheduleSlot();
		selectedCourseLabel = 'Seleccionar asignatura';
		selectedProfessorLabel = 'Seleccionar docente';
	}

	function openCreateSheet() {
		resetCreateForm();
		isCreateSheetOpen = true;
	}

	function openEditDialog(lab: LabGroup) {
		editForm = {
			labId: lab.id,
			currentCapacity: String(lab.capacity),
			newCapacity: String(lab.capacity)
		};
		isEditOpen = true;
	}

	async function handleUpdateCapacity() {
		isUpdating = true;
		try {
			await secretaryService.updateLabCapacity(editForm.labId, String(editForm.newCapacity));
			isEditOpen = false;
			await loadData();
		} catch (error) {
			alert('No se pudo actualizar la capacidad.');
		} finally {
			isUpdating = false;
		}
	}

	$: getCourseInfo = (id: string) => {
		const c = courses.find((c) => c.id === id);
		return c ? { name: c.name, code: c.code } : { name: 'Desconocido', code: '???' };
	};

	$: getTeacherName = (id: string) => {
		const t = teachers.find((u) => u.id === id);
		return t ? `${t.name} ${t.surname}` : 'Desconocido';
	};

	$: getClassroomName = (id: string) =>
		classrooms.find((c) => c.id === id)?.name || 'Seleccionar Aula';

	onMount(loadData);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Gestión de Laboratorios</h2>
			<p class="text-muted-foreground">
				Administra grupos, horarios múltiples y cupos de laboratorio.
			</p>
		</div>

		<Button onclick={openCreateSheet}>
			<Plus class="mr-2 h-4 w-4" />
			Nuevo Laboratorio
		</Button>
	</div>

	<Sheet.Root bind:open={isCreateSheetOpen}>
		<Sheet.Content side="right" class="overflow-y-auto p-0 sm:max-w-xl">
			<div class="border-b px-6 py-4">
				<Sheet.Header>
					<Sheet.Title>Nuevo Grupo de Laboratorio</Sheet.Title>
					<Sheet.Description
						>Configura la asignatura, docente y horarios semanales.</Sheet.Description
					>
				</Sheet.Header>
			</div>

			<div class="space-y-6 p-6">
				<div class="space-y-4">
					<h3 class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<FlaskConical class="h-4 w-4" /> Información General
					</h3>

					<div class="grid gap-4 rounded-lg border bg-muted/20 p-4">
						<div class="grid gap-2">
							<Label>Semestre</Label>
							<Input value={createForm.semester} disabled class="bg-muted font-mono" />
						</div>

						<div class="grid gap-2">
							<Label>Asignatura</Label>
							<Select.Root
								type="single"
								onValueChange={(v) => {
									createForm.courseId = String(v);
									selectedCourseLabel = courses.find((c) => c.id === v)?.name || 'Seleccionado';
								}}
							>
								<Select.Trigger class="w-full bg-background">
									{selectedCourseLabel}
								</Select.Trigger>
								<Select.Content class="max-h-[200px]">
									{#each courses as course}
										<Select.Item value={course.id} label={course.name}>
											<span class="mr-2 font-mono text-xs text-muted-foreground">{course.code}</span
											>
											{course.name}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>

						<div class="grid gap-2">
							<Label>Docente Encargado</Label>
							<Select.Root
								type="single"
								onValueChange={(v) => {
									createForm.professorId = String(v);
									const t = teachers.find((u) => u.id === v);
									selectedProfessorLabel = t ? `${t.name} ${t.surname}` : 'Seleccionado';
								}}
							>
								<Select.Trigger class="w-full bg-background">
									{selectedProfessorLabel}
								</Select.Trigger>
								<Select.Content class="max-h-[200px]">
									{#each teachers as teacher}
										<Select.Item value={teacher.id} label={`${teacher.name} ${teacher.surname}`}>
											{teacher.name}
											{teacher.surname}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="grid gap-2">
								<Label for="group">Grupo</Label>
								<Input
									id="group"
									bind:value={createForm.groupLetter}
									maxlength={1}
									placeholder="A"
									class="bg-background uppercase"
								/>
							</div>
							<div class="grid gap-2">
								<Label for="capacity">Capacidad</Label>
								<Input
									id="capacity"
									type="number"
									bind:value={createForm.capacity}
									min="1"
									max="50"
									class="bg-background"
								/>
							</div>
						</div>
					</div>
				</div>

				<Separator />

				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<h3 class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
							<CalendarDays class="h-4 w-4" /> Horarios de Clase
						</h3>
						<Button variant="outline" size="sm" onclick={addScheduleSlot}>
							<Plus class="mr-1 h-3 w-3" /> Agregar Horario
						</Button>
					</div>

					<div class="space-y-3">
						{#each createForm.schedules as schedule, index}
							<Card.Root class="relative">
								<Button
									variant="ghost"
									size="icon"
									class="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
									onclick={() => removeScheduleSlot(index)}
									disabled={createForm.schedules.length === 1}
								>
									<Trash2 class="h-3 w-3" />
								</Button>

								<div class="grid gap-3 p-3">
									<div class="grid grid-cols-2 gap-3">
										<div class="grid gap-1.5">
											<Label class="text-xs">Día</Label>
											<Select.Root
												type="single"
												onValueChange={(v) => updateSchedule(index, 'day', String(v))}
											>
												<Select.Trigger class="h-8 text-xs">
													{schedule.day || 'Día'}
												</Select.Trigger>
												<Select.Content>
													{#each days as day}
														<Select.Item value={day} label={day}>{day}</Select.Item>
													{/each}
												</Select.Content>
											</Select.Root>
										</div>

										<div class="grid gap-1.5">
											<Label class="text-xs">Aula</Label>
											<Select.Root
												type="single"
												onValueChange={(v) => updateSchedule(index, 'classroomId', String(v))}
											>
												<Select.Trigger class="h-8 text-xs">
													<span class="truncate">{getClassroomName(schedule.classroomId)}</span>
												</Select.Trigger>
												<Select.Content class="max-h-[150px]">
													{#each classrooms as room}
														<Select.Item value={room.id} label={room.name}>
															{room.name}
														</Select.Item>
													{/each}
												</Select.Content>
											</Select.Root>
										</div>
									</div>

									<div class="grid grid-cols-2 gap-3">
										<div class="grid gap-1.5">
											<Label class="text-xs">Inicio</Label>
											<Select.Root
												type="single"
												onValueChange={(v) => updateSchedule(index, 'startTime', String(v))}
											>
												<Select.Trigger class="h-8 text-xs">
													{schedule.startTime || 'Inicio'}
												</Select.Trigger>
												<Select.Content class="max-h-[150px]">
													{#each timeSlots as t}
														<Select.Item value={t} label={t}>{t}</Select.Item>
													{/each}
												</Select.Content>
											</Select.Root>
										</div>

										<div class="grid gap-1.5">
											<Label class="text-xs">Fin</Label>
											<Select.Root
												type="single"
												onValueChange={(v) => updateSchedule(index, 'endTime', String(v))}
											>
												<Select.Trigger class="h-8 text-xs">
													{schedule.endTime || 'Fin'}
												</Select.Trigger>
												<Select.Content class="max-h-[150px]">
													{#each timeSlots as t}
														<Select.Item value={t} label={t}>{t}</Select.Item>
													{/each}
												</Select.Content>
											</Select.Root>
										</div>
									</div>
								</div>
							</Card.Root>
						{/each}
					</div>
				</div>
			</div>

			<div class="border-t bg-muted/10 p-6">
				<Button class="w-full" size="lg" disabled={isCreating} onclick={handleCreateLab}>
					{#if isCreating}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Crear Grupo Académico
				</Button>
			</div>
		</Sheet.Content>
	</Sheet.Root>

	<Dialog.Root bind:open={isEditOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Modificar Capacidad</Dialog.Title>
				<Dialog.Description>Ajusta el cupo máximo.</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label class="text-right">Actual</Label>
					<span class="col-span-3 font-mono">{editForm.currentCapacity}</span>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="new-cap" class="text-right">Nueva</Label>
					<Input
						id="new-cap"
						type="number"
						bind:value={editForm.newCapacity}
						min="1"
						max="50"
						class="col-span-3"
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (isEditOpen = false)}>Cancelar</Button>
				<Button onclick={handleUpdateCapacity} disabled={isUpdating}>
					{#if isUpdating}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Guardar
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Código</Table.Head>
						<Table.Head>Asignatura</Table.Head>
						<Table.Head>Grupo</Table.Head>
						<Table.Head>Horarios</Table.Head>
						<Table.Head>Docente</Table.Head>
						<Table.Head class="text-center">Matriculados</Table.Head>
						<Table.Head class="text-right">Acciones</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if isLoading}
						<Table.Row>
							<Table.Cell colspan={7} class="h-24 text-center">
								<LoaderCircle class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
							</Table.Cell>
						</Table.Row>
					{:else if labs.length === 0}
						<Table.Row>
							<Table.Cell colspan={7} class="h-24 text-center text-muted-foreground">
								No hay laboratorios registrados.
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each labs as lab}
							{@const courseInfo = getCourseInfo(lab.courseId)}
							<Table.Row>
								<Table.Cell class="font-mono text-muted-foreground">{courseInfo.code}</Table.Cell>
								<Table.Cell class="font-medium">
									<div class="flex items-center gap-2">
										<FlaskConical class="h-4 w-4 text-primary" />
										{courseInfo.name}
									</div>
								</Table.Cell>
								<Table.Cell>
									<Badge variant="secondary" class="font-mono">
										{lab.groupLetter}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<div class="flex flex-col gap-1.5">
										{#if lab.schedules && lab.schedules.length > 0}
											{#each lab.schedules as sch}
												<div class="flex items-center gap-2 text-xs">
													<Badge variant="outline" class="h-5 px-1 text-[10px] font-normal">
														{sch.day.substring(0, 3)}
													</Badge>
													<span class="font-mono text-muted-foreground">{sch.time}</span>
													<span class="flex items-center gap-0.5 text-[10px] text-muted-foreground">
														<MapPin class="h-3 w-3" />
														{sch.classroom}
													</span>
												</div>
											{/each}
										{:else}
											<span class="text-xs text-muted-foreground italic">Sin horario</span>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell class="text-sm">{getTeacherName(lab.professorId)}</Table.Cell>
								<Table.Cell class="text-center">
									<div class="flex flex-col items-center">
										<span class="font-mono text-sm font-medium">
											{lab.enrolled}/{lab.capacity}
										</span>
										{#if lab.isFull}
											<Badge variant="destructive" class="h-4 px-1 text-[10px]">Lleno</Badge>
										{:else}
											<Badge
												variant="outline"
												class="h-4 border-green-200 bg-green-50 px-1 text-[10px] text-green-600"
												>Disp</Badge
											>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button
										variant="ghost"
										size="icon"
										onclick={() => openEditDialog(lab)}
										title="Editar cupos"
									>
										<Pencil class="h-4 w-4" />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
