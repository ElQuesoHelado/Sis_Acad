<script lang="ts">
	import { studentService } from '$lib/core/services';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { BookCopy, Users, CalendarDays, Clock, MapPin, User } from '@lucide/svelte';

	interface ScheduleItem {
		courseName: string;
		groupType: string;
		groupLetter: string;
		day: string;
		startTime: string;
		endTime: string;
		classroomName: string;
		professorName: string;
	}

	let schedule: ScheduleItem[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	async function loadSchedule() {
		loading = true;
		error = '';
		try {
			schedule = await studentService.getScheduleBySemester('2024-I');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al cargar el horario';
			console.error('Error loading schedule:', err);
		} finally {
			loading = false;
		}
	}

	loadSchedule();

	const days = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
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
	const minHour = 7;
</script>

<div class="space-y-8">
	<h1 class="text-center text-3xl font-bold text-foreground">Horario de Clases</h1>

	<div class="relative overflow-auto rounded-lg border bg-card shadow-sm">
		<div
			class="grid min-w-[1000px]"
			style="grid-template-columns: auto repeat(5, 1fr); grid-template-rows: auto repeat({timeSlots.length}, 4.5rem);"
		>
			<div
				class="sticky top-0 z-10 border-r border-b bg-muted/50 p-3 text-center font-semibold text-muted-foreground"
			>
				Hora
			</div>
			{#each days as day}
				<div
					class="sticky top-0 z-10 border-b bg-muted/50 p-3 text-center font-semibold text-muted-foreground
					{[...days].pop() !== day ? 'border-r' : ''}"
				>
					{day}
				</div>
			{/each}

			{#each timeSlots as time, i}
				<div
					class="border-r p-3 text-right text-sm font-medium text-muted-foreground"
					style="grid-row-start: {i + 2};"
				>
					{time}
				</div>
				{#each days as day, j}
					<div
						class="border-b
						{[...days].pop() !== day ? 'border-r' : ''}"
						style="grid-row-start: {i + 2}; grid-column-start: {j + 2};"
					></div>
				{/each}
			{/each}

			{#each schedule as item}
				{@const dayIndex = days.indexOf(item.day)}
				{@const startHour = parseInt(item.startTime.split(':')[0])}
				{@const endHour = parseInt(item.endTime.split(':')[0])}
				{@const col = dayIndex + 2}
				{@const rowStart = startHour - minHour + 2}
				{@const rowSpan = endHour - startHour}

				{#if col >= 2}
					<HoverCard.Root openDelay={150}>
						<HoverCard.Trigger
							class="relative m-1 flex cursor-pointer flex-col gap-1 rounded-lg p-2.5 text-xs shadow-md transition-all hover:shadow-lg
							{item.groupType === 'Teoria'
								? 'border border-blue-200 bg-blue-100 text-blue-800 dark:border-chart-3/20 dark:bg-chart-3/10 dark:text-chart-3'
								: 'border border-teal-200 bg-teal-100 text-teal-800 dark:border-chart-2/20 dark:bg-chart-2/10 dark:text-chart-2'}"
							style="grid-column-start: {col}; grid-row-start: {rowStart}; grid-row-span: {rowSpan};"
						>
							<span class="line-clamp-2 text-sm leading-tight font-bold">{item.courseName}</span>

							<div class="flex items-center gap-1.5 text-muted-foreground">
								<MapPin class="h-3 w-3 shrink-0" />
								<span>{item.classroomName}</span>
							</div>

							<div class="mt-auto flex items-center gap-1.5 pt-1 text-muted-foreground/90">
								<User class="h-3 w-3 shrink-0" />
								<span>{item.courseName}</span>
							</div>
						</HoverCard.Trigger>

						<HoverCard.Content class="w-80" side="right" align="start">
							<div class="space-y-4 p-2">
								<div class="flex items-start gap-3">
									<BookCopy class="h-5 w-5 shrink-0 text-muted-foreground" />
									<div>
										<h3 class="text-sm font-medium text-muted-foreground">Curso</h3>
										<p class="text-foreground">{item.courseName}</p>
									</div>
								</div>
								<div class="flex items-start gap-3">
									<Users class="h-5 w-5 shrink-0 text-muted-foreground" />
									<div>
										<h3 class="text-sm font-medium text-muted-foreground">Tipo</h3>
										<p class="text-foreground">{item.groupType} {item.groupLetter}</p>
									</div>
								</div>
								<div class="flex items-start gap-3">
									<CalendarDays class="h-5 w-5 shrink-0 text-muted-foreground" />
									<div>
										<h3 class="text-sm font-medium text-muted-foreground">Día</h3>
										<p class="text-foreground">{item.day}</p>
									</div>
								</div>
								<div class="flex items-start gap-3">
									<Clock class="h-5 w-5 shrink-0 text-muted-foreground" />
									<div>
										<h3 class="text-sm font-medium text-muted-foreground">Horario</h3>
										<p class="text-foreground">{item.startTime} - {item.endTime}</p>
									</div>
								</div>
								<div class="flex items-start gap-3">
									<MapPin class="h-5 w-5 shrink-0 text-muted-foreground" />
									<div>
										<h3 class="text-sm font-medium text-muted-foreground">Aula</h3>
										<p class="text-foreground">{item.classroomName}</p>
									</div>
								</div>
								<div class="flex items-start gap-3">
									<User class="h-5 w-5 shrink-0 text-muted-foreground" />
									<div>
										<h3 class="text-sm font-medium text-muted-foreground">Profesor</h3>
										<p class="text-foreground">{item.professorName}</p>
									</div>
								</div>
							</div>
						</HoverCard.Content>
					</HoverCard.Root>
				{/if}
			{/each}
		</div>
	</div>

	<div class="mt-6 flex justify-center gap-6 text-sm">
		<div class="flex items-center gap-2">
			<div
				class="h-4 w-4 rounded border border-blue-200 bg-blue-100 dark:border-chart-3/20 dark:bg-chart-3/10"
			></div>
			<span class="text-muted-foreground">Teoría</span>
		</div>
		<div class="flex items-center gap-2">
			<div
				class="h-4 w-4 rounded border border-teal-200 bg-teal-100 dark:border-chart-2/20 dark:bg-chart-2/10"
			></div>
			<span class="text-muted-foreground">Laboratorio</span>
		</div>
	</div>
</div>
