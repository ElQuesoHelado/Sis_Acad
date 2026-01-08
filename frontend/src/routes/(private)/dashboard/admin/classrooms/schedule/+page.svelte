<script lang="ts">
	import { onMount } from 'svelte';
	import { classroomService } from '$lib/core/services/classroom.service';
	import type { Classroom, ClassroomScheduleEntry } from '$lib/core/domain/classroom.types';

	import * as Select from '$lib/components/ui/select';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { cn } from '$lib/utils/cn';

	import {
		CalendarDays,
		Clock,
		MapPin,
		CalendarCheck,
		ChevronLeft,
		ChevronRight,
		Building2,
		LoaderCircle,
		User,
		Calendar as CalendarIcon
	} from '@lucide/svelte';

	let classrooms: Classroom[] = $state([]);
	let allScheduleItems: ClassroomScheduleEntry[] = $state([]);

	let isLoadingClassrooms = $state(true);
	let isLoadingSchedule = $state(false);

	let selectedClassroomId = $state('');
	let selectedClassroomName = $state('Seleccionar salón');
	let selectedClassroomCapacity = $state(0);
	let semester = $state('2025-II');

	let currentDate = $state(new Date());

	function getStartOfWeek(date: Date) {
		const d = new Date(date);
		const day = d.getDay();

		const diff = d.getDate() - day + (day === 0 ? -6 : 1);
		const monday = new Date(d.setDate(diff));
		monday.setHours(0, 0, 0, 0);
		return monday;
	}

	function getEndOfWeek(date: Date) {
		const monday = getStartOfWeek(date);
		const sunday = new Date(monday);
		sunday.setDate(monday.getDate() + 6);
		sunday.setHours(23, 59, 59, 999);
		return sunday;
	}

	function prevWeek() {
		const d = new Date(currentDate);
		d.setDate(d.getDate() - 7);
		currentDate = d;
	}

	function nextWeek() {
		const d = new Date(currentDate);
		d.setDate(d.getDate() + 7);
		currentDate = d;
	}

	function goToToday() {
		currentDate = new Date();
	}

	let filteredSchedule = $derived(
		allScheduleItems.filter((item) => {
			if (item.type === 'FIXED_CLASS') {
				return true;
			}

			if (item.type === 'RESERVATION' && item.date) {
				const [year, month, day] = item.date.split('-').map(Number);
				const itemDate = new Date(year, month - 1, day);

				const start = getStartOfWeek(currentDate);
				const end = getEndOfWeek(currentDate);

				return itemDate >= start && itemDate <= end;
			}

			return false;
		})
	);

	const weekStartDisplay = $derived(
		getStartOfWeek(currentDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
	);

	onMount(async () => {
		try {
			classrooms = await classroomService.getAllClassrooms();
		} catch (error) {
			console.error('Error cargando aulas:', error);
		} finally {
			isLoadingClassrooms = false;
		}
	});

	$effect(() => {
		if (selectedClassroomId && semester) {
			fetchSchedule();
		}
	});

	async function fetchSchedule() {
		isLoadingSchedule = true;
		allScheduleItems = [];
		try {
			allScheduleItems = await classroomService.getClassroomSchedule(selectedClassroomId, semester);
		} catch (error) {
			console.error('Error cargando horario:', error);
		} finally {
			isLoadingSchedule = false;
		}
	}

	const days = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
	const minHour = 7;
	const timeSlots = Array.from({ length: 15 }, (_, i) => `${i + minHour}:00`);

	function getGridPosition(item: ClassroomScheduleEntry) {
		const dayIndex = days.indexOf(item.day.toUpperCase());
		if (dayIndex === -1) return null;

		const [startH, startM] = item.startTime.split(':').map(Number);
		const [endH, endM] = item.endTime.split(':').map(Number);

		const col = dayIndex + 2;
		const startRow = startH - minHour + 2;

		const durationMinutes = endH * 60 + endM - (startH * 60 + startM);
		const rowSpan = Math.ceil(durationMinutes / 60);

		return { col, rowStart: startRow, rowSpan };
	}

	function getCardColorClass(type: string): string {
		switch (type) {
			case 'FIXED_CLASS':
				return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
			case 'RESERVATION':
				return 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300';
			default:
				return 'bg-gray-100';
		}
	}
</script>

<div class="mx-auto max-w-7xl space-y-6 p-4">
	<div class="bg-card flex flex-col gap-6 rounded-lg border p-6 shadow-sm">
		<div class="flex items-center justify-between">
			<h1 class="flex items-center gap-2 text-2xl font-bold">
				<CalendarIcon class="h-6 w-6" /> Horario por Ambiente
			</h1>
			<div class="flex items-center gap-2">
				<div class="bg-muted/40 flex items-center rounded-md p-1">
					<Button variant="ghost" size="icon" onclick={prevWeek}>
						<ChevronLeft class="h-4 w-4" />
					</Button>
					<span class="w-40 select-none text-center text-sm font-medium capitalize tabular-nums">
						Semana {weekStartDisplay}
					</span>
					<Button variant="ghost" size="icon" onclick={nextWeek}>
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>
				<Button variant="outline" size="sm" onclick={goToToday}>Hoy</Button>
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<Label>Seleccionar Salón</Label>
				<Select.Root
					type="single"
					onValueChange={(v) => {
						const room = classrooms.find((c) => c.id === v);
						if (room) {
							selectedClassroomId = room.id;
							selectedClassroomName = room.name;
							selectedClassroomCapacity = room.capacity;
						}
					}}
				>
					<Select.Trigger class="h-12 w-full">
						<div class="flex items-center gap-3 text-left">
							<div class="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
								<Building2 class="text-primary h-4 w-4" />
							</div>
							<div class="flex flex-col gap-0.5">
								<span class="text-sm font-medium leading-none">
									{isLoadingClassrooms ? 'Cargando aulas...' : selectedClassroomName}
								</span>
								{#if selectedClassroomId}
									<span class="text-muted-foreground text-xs"
										>Capacidad: {selectedClassroomCapacity} estudiantes</span
									>
								{/if}
							</div>
						</div>
					</Select.Trigger>
					<Select.Content class="max-h-[300px]">
						{#each classrooms as room}
							<Select.Item value={room.id} label={room.name} class="py-3">
								<div class="flex flex-col gap-1">
									<span class="font-medium">{room.name}</span>
									<span class="text-muted-foreground flex items-center gap-1 text-xs">
										<User class="h-3 w-3" /> Capacidad: {room.capacity}
									</span>
								</div>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-2">
				<Label>Semestre</Label>
				<Input bind:value={semester} class="h-12" placeholder="Ej. 2025-II" />
			</div>
		</div>
	</div>

	{#if !selectedClassroomId}
		<div
			class="text-muted-foreground bg-card/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-24"
		>
			<Building2 class="mb-4 h-16 w-16 opacity-10" />
			<p class="text-xl font-medium">Selecciona un salón para comenzar</p>
			<p class="text-sm">Podrás ver la disponibilidad y reservas por semana.</p>
		</div>
	{:else if isLoadingSchedule}
		<div class="flex justify-center py-24">
			<LoaderCircle class="text-primary h-10 w-10 animate-spin" />
		</div>
	{:else}
		<div class="bg-card relative overflow-auto rounded-lg border shadow-sm">
			<div
				class="grid min-w-[1000px]"
				style="grid-template-columns: 80px repeat({days.length}, 1fr); grid-template-rows: 40px repeat({timeSlots.length}, 5rem);"
			>
				<div
					class="bg-muted/95 text-muted-foreground sticky top-0 z-10 border-b border-r p-2 text-center text-xs font-bold backdrop-blur"
				>
					Hora
				</div>
				{#each days as day}
					<div
						class="bg-muted/95 text-muted-foreground sticky top-0 z-10 border-b border-r p-2 text-center text-xs font-bold backdrop-blur last:border-r-0"
					>
						{day}
					</div>
				{/each}

				{#each timeSlots as time, i}
					<div
						class="bg-muted/5 text-muted-foreground border-b border-r p-2 text-center text-xs font-medium"
						style="grid-row-start: {i + 2};"
					>
						{time}
					</div>
					{#each days as _, j}
						<div
							class="border-b border-r last:border-r-0"
							style="grid-row-start: {i + 2}; grid-column-start: {j + 2};"
						></div>
					{/each}
				{/each}

				{#each filteredSchedule as item}
					{@const pos = getGridPosition(item)}
					{#if pos}
						<HoverCard.Root openDelay={100}>
							<HoverCard.Trigger
								class={cn(
									'relative z-10 m-1 flex cursor-pointer flex-col gap-1 overflow-hidden rounded-md border p-2 text-xs shadow-sm transition-all hover:scale-[1.02] hover:shadow-md',
									getCardColorClass(item.type)
								)}
								style="
                                grid-column-start: {pos.col}; 
                                grid-row-start: {pos.rowStart}; 
                                grid-row-end: span {pos.rowSpan};
                            "
							>
								<div
									class={cn(
										'absolute bottom-0 left-0 top-0 w-1',
										item.type === 'FIXED_CLASS' ? 'bg-blue-500' : 'bg-purple-500'
									)}
								></div>

								<div class="flex h-full flex-col space-y-0.5 pl-2">
									<span class="line-clamp-2 font-bold leading-tight">
										{item.title}
									</span>
									<div class="mt-auto flex items-center gap-1 opacity-80">
										<User class="h-3 w-3 shrink-0" />
										<span class="truncate">{item.professorName}</span>
									</div>
									{#if item.type === 'RESERVATION'}
										<div
											class="mt-1 flex w-fit items-center gap-1 rounded bg-white/60 px-1 py-0.5 text-[10px] font-bold text-purple-700"
										>
											<CalendarCheck class="h-3 w-3" />
											{item.date}
										</div>
									{/if}
								</div>
							</HoverCard.Trigger>

							<HoverCard.Content class="w-72 overflow-hidden p-0" side="right" align="start">
								<div
									class={cn(
										'h-2 w-full',
										item.type === 'FIXED_CLASS' ? 'bg-blue-500' : 'bg-purple-500'
									)}
								></div>
								<div class="space-y-3 p-4">
									<div class="space-y-1">
										<h4 class="text-sm font-semibold">{item.title}</h4>
										<p class="text-muted-foreground text-xs">
											{item.type === 'FIXED_CLASS' ? 'Clase Regular' : 'Reserva de Sala'}
										</p>
									</div>
									<div class="grid grid-cols-2 gap-2 text-xs">
										<div class="flex items-center gap-2">
											<Clock class="text-muted-foreground h-4 w-4" />
											<span>{item.startTime} - {item.endTime}</span>
										</div>
										<div class="flex items-center gap-2">
											<User class="text-muted-foreground h-4 w-4" />
											<span class="truncate">{item.professorName}</span>
										</div>
										{#if item.date && item.type === 'RESERVATION'}
											<div
												class="col-span-2 flex items-center gap-2 rounded bg-purple-50 p-1.5 font-medium text-purple-600"
											>
												<CalendarDays class="h-4 w-4" />
												<span>Fecha: {item.date}</span>
											</div>
										{/if}
									</div>
								</div>
							</HoverCard.Content>
						</HoverCard.Root>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
