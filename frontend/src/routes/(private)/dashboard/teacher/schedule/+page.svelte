<script lang="ts">
	import { teacherService } from '$lib/core/services';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { Button } from '$lib/components/ui/button';
	import {
		CalendarDays,
		Clock,
		MapPin,
		CalendarCheck,
		ChevronLeft,
		ChevronRight,
		Calendar as CalendarIcon
	} from '@lucide/svelte';
	import type { TeacherScheduleEntry } from '$lib/core/domain';
	import { cn } from '$lib/utils/cn';

	let schedule: TeacherScheduleEntry[] = $state([]);
	let loading = $state(true);
	let currentDate = $state(new Date());

	function getStartOfWeek(date: Date) {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1);
		return new Date(d.setDate(diff));
	}

	function formatDate(date: Date) {
		return date.toISOString().split('T')[0];
	}

	async function loadSchedule() {
		loading = true;
		try {
			schedule = await teacherService.getScheduleBySemester('2024-I', formatDate(currentDate));
		} catch (err) {
			console.error('Error loading schedule:', err);
		} finally {
			loading = false;
		}
	}

	function prevWeek() {
		const d = new Date(currentDate);
		d.setDate(d.getDate() - 7);
		currentDate = d;
		loadSchedule();
	}

	function nextWeek() {
		const d = new Date(currentDate);
		d.setDate(d.getDate() + 7);
		currentDate = d;
		loadSchedule();
	}

	function goToToday() {
		currentDate = new Date();
		loadSchedule();
	}

	loadSchedule();

	const days = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
	const timeSlots = Array.from({ length: 15 }, (_, i) => `${i + 7}:00`);
	const minHour = 7;

	function getGridPosition(item: TeacherScheduleEntry) {
		const dayIndex = days.indexOf(item.day);
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
			case 'Teoria':
				return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
			case 'Labo':
				return 'bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-300';
			case 'Reserva':
				return 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300';
			default:
				return 'bg-gray-100';
		}
	}

	const weekStartDisplay = $derived(
		getStartOfWeek(currentDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
	);
</script>

<div class="mx-auto max-w-7xl space-y-6 p-4">
	<div
		class="flex flex-col items-center justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm sm:flex-row"
	>
		<h1 class="flex items-center gap-2 text-2xl font-bold">
			<CalendarIcon class="h-6 w-6" /> Mi Horario
		</h1>

		<div class="flex items-center gap-2 rounded-md bg-muted/30 p-1">
			<Button variant="ghost" size="icon" onclick={prevWeek}>
				<ChevronLeft class="h-4 w-4" />
			</Button>
			<span class="w-32 text-center text-sm font-medium capitalize select-none">
				Semana {weekStartDisplay}
			</span>
			<Button variant="ghost" size="icon" onclick={nextWeek}>
				<ChevronRight class="h-4 w-4" />
			</Button>
		</div>

		<Button variant="outline" size="sm" onclick={goToToday}>Hoy</Button>
	</div>

	<div class="relative overflow-auto rounded-lg border bg-card shadow-sm">
		<div
			class="grid min-w-[800px]"
			style="grid-template-columns: 80px repeat({days.length}, 1fr); grid-template-rows: 40px repeat({timeSlots.length}, 5rem);"
		>
			<div
				class="sticky top-0 z-10 border-r border-b bg-muted/80 p-2 text-center text-xs font-bold text-muted-foreground backdrop-blur"
			>
				Hora
			</div>
			{#each days as day}
				<div
					class="sticky top-0 z-10 border-r border-b bg-muted/80 p-2 text-center text-xs font-bold text-muted-foreground backdrop-blur last:border-r-0"
				>
					{day}
				</div>
			{/each}

			{#each timeSlots as time, i}
				<div
					class="border-r border-b bg-muted/5 p-2 text-center text-xs font-medium text-muted-foreground"
					style="grid-row-start: {i + 2};"
				>
					{time}
				</div>
				{#each days as _, j}
					<div
						class="border-r border-b last:border-r-0"
						style="grid-row-start: {i + 2}; grid-column-start: {j + 2};"
					></div>
				{/each}
			{/each}

			{#each schedule as item}
				{@const pos = getGridPosition(item)}
				{#if pos}
					<HoverCard.Root openDelay={100}>
						<HoverCard.Trigger
							class={cn(
								'relative m-1 flex cursor-pointer flex-col gap-1 overflow-hidden rounded-md border p-2 text-xs shadow-sm transition-all hover:scale-[1.02] hover:shadow-md',
								getCardColorClass(item.groupType)
							)}
							style="
								grid-column-start: {pos.col}; 
								grid-row-start: {pos.rowStart}; 
								grid-row-end: span {pos.rowSpan};
							"
						>
							<div
								class={cn(
									'absolute top-0 bottom-0 left-0 w-1',
									item.groupType === 'Teoria'
										? 'bg-blue-500'
										: item.groupType === 'Labo'
											? 'bg-teal-500'
											: 'bg-purple-500'
								)}
							></div>

							<div class="flex h-full flex-col space-y-0.5 pl-2">
								<span class="line-clamp-2 leading-tight font-bold">
									{item.courseName}
								</span>
								<div class="flex items-center gap-1 opacity-80">
									<MapPin class="h-3 w-3" />
									{item.classroomName}
								</div>
								{#if item.groupType === 'Reserva'}
									<div
										class="mt-auto flex w-fit items-center gap-1 rounded bg-white/50 px-1 text-[10px] font-medium"
									>
										<CalendarCheck class="h-3 w-3" /> Reserva
									</div>
								{/if}
							</div>
						</HoverCard.Trigger>

						<HoverCard.Content class="w-72 overflow-hidden p-0" side="right" align="start">
							<div
								class={cn(
									'h-2 w-full',
									item.groupType === 'Teoria'
										? 'bg-blue-500'
										: item.groupType === 'Labo'
											? 'bg-teal-500'
											: 'bg-purple-500'
								)}
							></div>
							<div class="space-y-3 p-4">
								<div class="space-y-1">
									<h4 class="text-sm font-semibold">{item.courseName}</h4>
									<p class="text-xs text-muted-foreground">{item.groupType} - {item.groupLetter}</p>
								</div>
								<div class="grid grid-cols-2 gap-2 text-xs">
									<div class="flex items-center gap-2">
										<Clock class="h-4 w-4 text-muted-foreground" />
										<span>{item.startTime} - {item.endTime}</span>
									</div>
									<div class="flex items-center gap-2">
										<MapPin class="h-4 w-4 text-muted-foreground" />
										<span>{item.classroomName}</span>
									</div>
									{#if item.date}
										<div class="col-span-2 flex items-center gap-2 font-medium text-purple-600">
											<CalendarDays class="h-4 w-4" />
											<span>{item.date}</span>
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
</div>
