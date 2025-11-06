<script lang="ts">
	import { teacherService } from '$lib/core/services';
	import {
		AttendanceStatus,
		type TeacherGroup,
		type StudentRosterEntry,
		type TakeAttendanceInput
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
	import { Label } from '$lib/components/ui/label';

	const semesters = ['2024-I', '2024-II', '2023-II', '2023-I'];
	let selectedSemester = $state('2024-I');

	let groups: TeacherGroup[] = $state([]);
	let selectedGroup: TeacherGroup | null = $state(null);

	let roster: StudentRosterEntry[] = $state([]);
	let attendanceDate = $state(new Date().toISOString().split('T')[0]);

	let attendanceStatus = $state(new Map<string, AttendanceStatus>());

	let loadingGroups = $state(false);
	let loadingRoster = $state(false);
	let isSaving = $state(false);

	let loadError = $state('');
	let saveError = $state('');
	let saveSuccess = $state('');

	$effect(() => {
		async function loadGroups() {
			if (!selectedSemester) return;
			loadingGroups = true;
			loadError = '';
			selectedGroup = null;
			roster = [];
			groups = [];

			try {
				groups = await teacherService.getGroupsBySemester(selectedSemester);
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
				roster = [];
				attendanceStatus = new Map();
				return;
			}

			loadingRoster = true;
			loadError = '';
			roster = [];

			try {
				const rosterData = await teacherService.getStudentRoster(
					selectedGroup.groupId,
					selectedGroup.groupType
				);
				roster = rosterData;

				const newMap = new Map<string, AttendanceStatus>();
				for (const student of rosterData) {
					newMap.set(student.enrollmentId, AttendanceStatus.ABSENT);
				}
				attendanceStatus = newMap;
			} catch (err) {
				loadError = err instanceof Error ? err.message : 'Error al cargar los estudiantes';
			} finally {
				loadingRoster = false;
			}
		}
		loadRoster();
	});

	async function handleSaveAttendance() {
		if (!selectedGroup || !attendanceDate || roster.length === 0) {
			saveError = 'Por favor, seleccione un grupo y una fecha.';
			return;
		}

		isSaving = true;
		saveError = '';
		saveSuccess = '';

		const records = Array.from(attendanceStatus.entries()).map(([enrollmentId, status]) => ({
			enrollmentId,
			status
		}));

		const data: TakeAttendanceInput = {
			groupId: selectedGroup.groupId,
			classType: selectedGroup.groupType,
			date: attendanceDate,
			records: records
		};

		try {
			await teacherService.takeAttendance(data);
			saveSuccess = 'Asistencia guardada exitosamente.';
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Error al guardar la asistencia.';
		} finally {
			isSaving = false;
			setTimeout(() => {
				saveSuccess = '';
				saveError = '';
			}, 5000);
		}
	}

	const handleSubmit = preventDefault(handleSaveAttendance);

	function setStudentStatus(enrollmentId: string, status: AttendanceStatus) {
		const newMap = new Map(attendanceStatus);
		newMap.set(enrollmentId, status);
		attendanceStatus = newMap;
	}

	function markAll(status: AttendanceStatus) {
		const newMap = new Map<string, AttendanceStatus>();
		for (const student of roster) {
			newMap.set(student.enrollmentId, status);
		}
		attendanceStatus = newMap;
	}
</script>

{#snippet title()}
	Marcar Asistencia
{/snippet}

<form onsubmit={handleSubmit} class="space-y-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>Selección de Sesión</Card.Title>
			<Card.Description>
				Elige el semestre, el grupo y la fecha para tomar asistencia.
			</Card.Description>
		</Card.Header>
		<Card.Content class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div>
				<Label class="mb-1.5 text-sm font-medium">Semestre</Label>
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
				<Label class="mb-1.5 text-sm font-medium">Grupo</Label>
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
							<DDropdownMenu.Item disabled>No hay grupos este semestre</DDropdownMenu.Item>
						{/if}
					</DDropdownMenu.Content>
				</DDropdownMenu.Root>
			</div>

			<div>
				<Label for="attendance-date" class="mb-1.5 text-sm font-medium">Fecha</Label>
				<Input id="attendance-date" type="date" bind:value={attendanceDate} required />
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

	{#if roster.length > 0 && !loadingRoster}
		<Card.Root>
			<Card.Header>
				<Card.Title>Lista de Estudiantes</Card.Title>
				<Card.Description>
					Marca la asistencia para la fecha seleccionada. Por defecto, todos están "Ausente".
				</Card.Description>
				<div class="flex gap-2 pt-2">
					<Button
						type="button"
						size="sm"
						variant="outline"
						onclick={() => markAll(AttendanceStatus.PRESENT)}
					>
						Marcar Todos como Presente
					</Button>
					<Button
						type="button"
						size="sm"
						variant="outline"
						onclick={() => markAll(AttendanceStatus.ABSENT)}
					>
						Marcar Todos como Ausente
					</Button>
				</div>
			</Card.Header>
			<Card.Content class="overflow-x-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="min-w-[100px]">Código</Table.Head>
							<Table.Head class="min-w-[250px]">Estudiante</Table.Head>
							<Table.Head class="w-[200px] text-right">Asistencia</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each roster as student (student.enrollmentId)}
							{@const status = attendanceStatus.get(student.enrollmentId)}
							<Table.Row>
								<Table.Cell class="font-mono">{student.studentCode}</Table.Cell>
								<Table.Cell class="font-medium whitespace-nowrap">
									{student.surname}, {student.name}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										<Button
											type="button"
											size="sm"
											variant={status === AttendanceStatus.PRESENT ? 'secondary' : 'outline'}
											class="w-[90px]"
											onclick={() =>
												setStudentStatus(student.enrollmentId, AttendanceStatus.PRESENT)}
										>
											Presente
										</Button>
										<Button
											type="button"
											size="sm"
											variant={status === AttendanceStatus.ABSENT ? 'destructive' : 'outline'}
											class="w-[90px]"
											onclick={() =>
												setStudentStatus(student.enrollmentId, AttendanceStatus.ABSENT)}
										>
											Ausente
										</Button>
									</div>
								</Table.Cell>
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
						Guardar Asistencia
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
	{/if}
</form>
