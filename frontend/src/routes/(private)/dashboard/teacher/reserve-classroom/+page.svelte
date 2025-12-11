<script lang="ts">
	import { classroomService, teacherService } from '$lib/core/services';
	import type {
		CreateReservationInput,
		AvailableClassroom,
		TeacherScheduleEntry
	} from '$lib/core/domain/teacher.types';

	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils/cn';
	import {
		Calendar as CalendarIcon,
		CheckCircle,
		AlertCircle,
		Loader2,
		Info,
		ArrowRight,
		UserX
	} from '@lucide/svelte';
	import { fade, slide } from 'svelte/transition';
	import type { ClassroomScheduleEntry } from '$lib/core/domain';

	type SlotStatus = 'free' | 'occupied' | 'reserved' | 'selected' | 'conflict';

	let classrooms: AvailableClassroom[] = $state([]);
	let selectedClassroomId = $state('');
	let selectedDate = $state(new Date().toISOString().split('T')[0]);

	let roomSchedule: ClassroomScheduleEntry[] = $state([]);

	let mySchedule: TeacherScheduleEntry[] = $state([]);

	let loadingData = $state(false);
	let isSubmitting = $state(false);
	let successMessage = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);

	let selectionStart = $state<string | null>(null);
	let selectionEnd = $state<string | null>(null);
	let hoverTime = $state<string | null>(null);

	let form: CreateReservationInput = $state({
		classroomId: '',
		semester: '2024-I',
		date: '',
		startTime: '',
		endTime: '',
		notes: ''
	});

	function mapErrorMessage(backendMessage: string): string {
		if (backendMessage.includes('past')) return 'No puedes crear reservas en fechas pasadas.';
		if (backendMessage.includes('advance'))
			return 'Solo se permiten reservas con hasta 2 semanas de anticipación.';
		if (backendMessage.includes('2 classes per week'))
			return 'Has alcanzado el límite máximo de reservas por semana.';
		if (backendMessage.includes('occupied') || backendMessage.includes('conflict'))
			return 'El horario seleccionado entra en conflicto con otra clase o reserva.';
		if (backendMessage.includes('overlap'))
			return 'Ya tienes otra reserva que se solapa con este horario.';
		return 'Ocurrió un error al procesar la reserva. Intenta nuevamente.';
	}

	function getDayNameLocal(dateStr: string) {
		if (!dateStr) return '';
		const [year, month, day] = dateStr.split('-').map(Number);
		const date = new Date(year, month - 1, day);
		const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
		return days[date.getDay()];
	}

	function timeToMinutes(timeStr: string): number {
		const [hours, minutes] = timeStr.split(':').map(Number);
		return hours * 60 + minutes;
	}

	const currentDayName = $derived(getDayNameLocal(selectedDate));
	const timeSlots = Array.from(
		{ length: 15 },
		(_, i) => `${(i + 7).toString().padStart(2, '0')}:00`
	);

	$effect(() => {
		classroomService.getAllClassrooms().then((res) => (classrooms = res));
	});

	$effect(() => {
		if (selectedClassroomId && selectedDate) {
			resetSelection();
			loadSchedules();
		}
	});

	function resetSelection() {
		selectionStart = null;
		selectionEnd = null;
		hoverTime = null;
		errorMessage = null;
		successMessage = null;
	}

	async function loadSchedules() {
		loadingData = true;
		try {
			const [roomRes, teacherRes] = await Promise.all([
				classroomService.getSchedule(selectedClassroomId, form.semester),
				teacherService.getScheduleBySemester(form.semester, selectedDate)
			]);

			roomSchedule = roomRes;
			mySchedule = teacherRes;
		} catch (e) {
			console.error(e);
			errorMessage = 'Error de conexión al cargar horarios.';
		} finally {
			loadingData = false;
		}
	}

	function getBaseSlotStatus(time: string): { status: SlotStatus; data: any } {
		const slotStart = timeToMinutes(time);
		const slotEnd = slotStart + 60;

		const roomFixed = roomSchedule.find((s) => {
			if (s.type !== 'FIXED_CLASS' || s.day !== currentDayName) return false;
			const start = timeToMinutes(s.startTime);
			const end = timeToMinutes(s.endTime);
			return start < slotEnd && end > slotStart;
		});
		if (roomFixed) return { status: 'occupied', data: roomFixed };

		const roomReserved = roomSchedule.find((s) => {
			if (s.type !== 'RESERVATION' || s.date !== selectedDate) return false;
			const start = timeToMinutes(s.startTime);
			const end = timeToMinutes(s.endTime);
			return start < slotEnd && end > slotStart;
		});
		if (roomReserved) return { status: 'reserved', data: roomReserved };

		const myConflict = mySchedule.find((s) => {
			if (s.day !== currentDayName) return false;

			if (s.groupType === 'Reserva' && s.date !== selectedDate) return false;

			const start = timeToMinutes(s.startTime);
			const end = timeToMinutes(s.endTime);
			return start < slotEnd && end > slotStart;
		});

		if (myConflict) return { status: 'conflict', data: myConflict };

		return { status: 'free', data: null };
	}

	function isSlotInSelection(time: string): boolean {
		if (!selectionStart) return false;
		const t = parseInt(time.split(':')[0]);
		const start = parseInt(selectionStart.split(':')[0]);

		if (selectionEnd) {
			const end = parseInt(selectionEnd.split(':')[0]);
			return t >= start && t <= end;
		}
		if (hoverTime) {
			const hover = parseInt(hoverTime.split(':')[0]);
			return t >= start && t <= hover;
		}
		return t === start;
	}

	function isRangeValid(startStr: string, endStr: string): boolean {
		const startHour = parseInt(startStr.split(':')[0]);
		const endHour = parseInt(endStr.split(':')[0]);

		for (let i = startHour; i <= endHour; i++) {
			const timeCheck = `${i.toString().padStart(2, '0')}:00`;
			const { status } = getBaseSlotStatus(timeCheck);
			if (status !== 'free') return false;
		}
		return true;
	}

	function handleSlotClick(time: string) {
		const { status } = getBaseSlotStatus(time);

		if (status !== 'free') return;

		if (selectionStart && selectionEnd) {
			selectionStart = time;
			selectionEnd = null;
			return;
		}

		if (!selectionStart) {
			selectionStart = time;
			return;
		}

		const startHour = parseInt(selectionStart.split(':')[0]);
		const currentHour = parseInt(time.split(':')[0]);

		if (currentHour < startHour) {
			selectionStart = time;
			return;
		}

		if (isRangeValid(selectionStart, time)) {
			selectionEnd = time;
			prepareForm();
		} else {
			errorMessage = 'El rango seleccionado interfiere con una clase ocupada o tu propia agenda.';
			setTimeout(() => (errorMessage = null), 3000);
			selectionStart = time;
		}
	}

	function prepareForm() {
		if (!selectionStart || !selectionEnd) return;
		const endHour = parseInt(selectionEnd.split(':')[0]) + 1;

		form.classroomId = selectedClassroomId;
		form.date = selectedDate;
		form.startTime = selectionStart;
		form.endTime = `${endHour.toString().padStart(2, '0')}:00`;

		setTimeout(() => {
			document
				.getElementById('confirm-card')
				?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}, 100);
	}

	async function handleReserve() {
		isSubmitting = true;
		errorMessage = null;
		successMessage = null;

		try {
			await teacherService.createReservation(form);
			successMessage = '¡Reserva realizada con éxito!';
			loadSchedules();
			form.notes = '';
			setTimeout(() => resetSelection(), 2500);
		} catch (err: any) {
			const rawError = err.response?.data?.message || err.message || '';
			errorMessage = mapErrorMessage(rawError);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
	<div
		class="flex flex-col items-start justify-between gap-4 border-b pb-6 md:flex-row md:items-center"
	>
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-foreground">Reservar Espacio</h1>
			<p class="mt-1 text-muted-foreground">
				Consulta disponibilidad y asegura tu aula en tiempo real.
			</p>
		</div>
	</div>

	<Card.Root class="bg-card/50 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<Card.Content class="flex flex-col items-end gap-6 p-6 md:flex-row">
			<div class="w-full space-y-2 md:w-1/3">
				<label class="text-sm leading-none font-medium">Aula</label>
				<div class="relative">
					<select
						class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						bind:value={selectedClassroomId}
					>
						<option value="" disabled selected>Seleccionar Salón...</option>
						{#each classrooms as room}
							<option value={room.id}>{room.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="w-full space-y-2 md:w-1/3">
				<label class="text-sm leading-none font-medium">Fecha</label>
				<Input type="date" bind:value={selectedDate} class="w-full" />
			</div>

			<div class="w-full pb-1 md:w-1/3">
				{#if currentDayName}
					<div
						class="flex w-fit items-center gap-2 rounded-md border bg-muted/30 px-4 py-2 font-semibold text-foreground"
					>
						<CalendarIcon class="h-4 w-4 text-muted-foreground" />
						{currentDayName}
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	{#if selectedClassroomId && selectedDate}
		<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12" transition:fade>
			<div class="space-y-4 lg:col-span-7 xl:col-span-8">
				<div class="mb-4 flex flex-wrap gap-x-6 gap-y-2 px-2 text-xs text-muted-foreground">
					<div class="flex items-center gap-2">
						<div class="h-2 w-2 rounded-full bg-foreground/20"></div>
						 Libre
					</div>
					<div class="flex items-center gap-2">
						<div class="h-2 w-2 rounded-full bg-primary"></div>
						 Selección
					</div>
					<div class="flex items-center gap-2">
						<div class="h-2 w-2 rounded-full bg-muted-foreground"></div>
						 Ocupado (Aula)
					</div>
					<div class="flex items-center gap-2">
						<div class="h-2 w-2 rounded-full bg-amber-500"></div>
						 Tu Agenda Ocupada
					</div>
				</div>

				<div class="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
					{#if loadingData}
						<div class="flex flex-col items-center justify-center gap-4 p-20 text-muted-foreground">
							<Loader2 class="h-8 w-8 animate-spin opacity-50" />
							<p class="text-sm">Cruzando agendas...</p>
						</div>
					{:else}
						<div class="divide-y divide-border">
							{#each timeSlots as time}
								{@const { status: baseStatus, data } = getBaseSlotStatus(time)}
								{@const isSelected = isSlotInSelection(time)}

								<button
									class={cn(
										'group relative flex min-h-[4rem] w-full items-stretch text-left transition-all duration-200 hover:z-10',

										baseStatus === 'free' && 'cursor-pointer bg-background hover:bg-muted/40',
										(baseStatus === 'occupied' || baseStatus === 'reserved') &&
											'cursor-not-allowed bg-muted/10',

										baseStatus === 'conflict' &&
											'cursor-not-allowed bg-amber-50/50 text-amber-900 dark:bg-amber-900/10 dark:text-amber-500',

										isSelected &&
											'z-20 border-y border-primary/50 bg-primary text-primary-foreground shadow-md hover:bg-primary'
									)}
									disabled={baseStatus !== 'free'}
									onclick={() => handleSlotClick(time)}
									onmouseenter={() => {
										if (selectionStart && !selectionEnd) hoverTime = time;
									}}
								>
									<div
										class={cn(
											'flex w-20 shrink-0 items-center justify-center border-r border-border/40 font-mono text-sm',
											isSelected ? 'font-semibold text-primary-foreground' : 'text-muted-foreground'
										)}
									>
										{time}
									</div>

									<div class="flex flex-1 items-center justify-between px-5 py-3">
										{#if isSelected}
											<div class="flex flex-col">
												<span class="flex items-center gap-2 text-sm font-semibold">
													{#if selectionStart === time}
														Inicio
													{:else}
														En curso
													{/if}
												</span>
											</div>
											<CheckCircle class="h-5 w-5 opacity-80" />
										{:else if baseStatus === 'free'}
											<span
												class="text-xs font-medium tracking-widest text-muted-foreground/20 uppercase transition-all group-hover:text-muted-foreground/60"
											>
												Disponible
											</span>
										{:else if baseStatus === 'conflict'}
											<div class="flex flex-col space-y-1 text-xs">
												<span
													class="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-500"
												>
													<UserX class="h-3.5 w-3.5" />
													Tu Agenda Ocupada
												</span>
												<span class="pl-5.5 text-amber-800/70 opacity-80 dark:text-amber-400/70">
													Tienes: {data?.courseName} ({data?.classroomName})
												</span>
											</div>
										{:else}
											<div class="flex flex-col space-y-1 text-xs">
												<span class="flex items-center gap-2 font-medium text-foreground/80">
													<div class="h-1.5 w-1.5 rounded-full bg-destructive/70"></div>
													{baseStatus === 'reserved' ? 'Reservado' : 'Clase Regular'}
												</span>
												<span class="pl-3.5 text-muted-foreground">
													{data?.title} • {data?.professorName}
												</span>
											</div>
										{/if}
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<div class="lg:col-span-5 xl:col-span-4">
				<div class="sticky top-8 space-y-6">
					{#if selectionStart && selectionEnd}
						<div id="confirm-card" transition:slide={{ axis: 'y' }}>
							<Card.Root class="overflow-hidden border bg-card shadow-md transition-all">
								<Card.Content class="space-y-6 p-6 md:p-8">
									<div class="space-y-2 border-b pb-4 text-center">
										<h2 class="text-xl font-semibold tracking-tight">Confirmar Detalles</h2>
										<p class="text-sm text-muted-foreground">
											Verifica la información antes de proceder.
										</p>
									</div>

									<div class="space-y-3 rounded-lg border bg-muted/30 p-4">
										<div class="flex items-center justify-between text-sm">
											<span class="text-muted-foreground">Aula</span>
											<span class="font-medium"
												>{classrooms.find((c) => c.id === form.classroomId)?.name}</span
											>
										</div>
										<div class="flex items-center justify-between text-sm">
											<span class="text-muted-foreground">Fecha</span>
											<span class="font-medium">{form.date}</span>
										</div>
										<div class="mt-2 flex items-center justify-between border-t pt-2">
											<span class="flex items-center gap-1.5 text-muted-foreground">
												<Info class="h-3.5 w-3.5" /> Horario
											</span>
											<span class="text-lg font-bold text-primary tabular-nums">
												{form.startTime} <span class="mx-1 text-muted-foreground/40">→</span>
												{form.endTime}
											</span>
										</div>
									</div>

									<div class="space-y-2">
										<label
											class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
											>Notas Adicionales</label
										>
										<textarea
											bind:value={form.notes}
											class="flex min-h-[100px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
											placeholder="Ej: Examen parcial, Recuperación de clase..."
										></textarea>
									</div>

									{#if errorMessage}
										<div
											class="flex items-start gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
											transition:slide
										>
											<AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
											<span>{errorMessage}</span>
										</div>
									{/if}
									{#if successMessage}
										<div
											class="flex items-start gap-3 rounded-md border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400"
											transition:slide
										>
											<CheckCircle class="mt-0.5 h-4 w-4 shrink-0" />
											<span>{successMessage}</span>
										</div>
									{/if}

									<div class="flex flex-col gap-3 pt-2">
										<Button
											class="h-11 w-full text-base shadow-sm"
											disabled={isSubmitting}
											onclick={handleReserve}
										>
											{#if isSubmitting}
												<Loader2 class="mr-2 h-4 w-4 animate-spin" /> Procesando...
											{:else}
												Confirmar Reserva <ArrowRight class="ml-2 h-4 w-4" />
											{/if}
										</Button>
										<Button
											variant="ghost"
											class="w-full text-muted-foreground hover:text-foreground"
											onclick={resetSelection}
											disabled={isSubmitting}
										>
											Cancelar Selección
										</Button>
									</div>
								</Card.Content>
							</Card.Root>
						</div>
					{:else}
						<div
							class="hidden h-64 flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed bg-muted/10 p-8 text-center text-muted-foreground lg:flex"
						>
							<div class="rounded-full border bg-background p-3 shadow-sm">
								<CalendarIcon class="h-6 w-6 opacity-40" />
							</div>
							<div>
								<h3 class="font-medium text-foreground">Selecciona un horario</h3>
								<p class="mx-auto mt-1 max-w-[200px] text-sm text-muted-foreground/80">
									Haz clic en la hora de inicio y luego en la hora final para crear tu reserva.
								</p>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
