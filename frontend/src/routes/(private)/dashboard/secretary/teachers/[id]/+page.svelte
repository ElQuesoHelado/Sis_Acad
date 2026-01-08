<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { secretaryService } from '$lib/core/services';
	import type { AdminTeacherDetails } from '$lib/core/domain/admin.types';
	import { APP_PATHS } from '$lib/utils/app-paths';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import {
		ChevronLeft,
		Loader2,
		AlertCircle,
		ChevronDown,
		MapPin,
		Users,
		BookCopy,
		CalendarDays
	} from '@lucide/svelte';

	let userId = $derived(page.params.id);
	let details: AdminTeacherDetails | null = $state(null);
	let loading = $state(true);
	let error = $state('');
	const semesters = ['2023-I', '2023-II', '2024-I', '2024-II', '2025-I', '2025-II'];
	let selectedSemester = $state('2025-II');

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

	$effect(() => {
		async function load() {
			if (!userId) return;
			loading = true;
			error = '';
			try {
				details = await secretaryService.getTeacherDetails(userId, selectedSemester);
			} catch (err) {
				error = err instanceof Error ? err.message : 'Error al cargar detalles';
			} finally {
				loading = false;
			}
		}
		load();
	});

	function goBack() {
		goto(APP_PATHS.SECRETARY.TEACHERS);
	}
</script>

{#snippet title()}
	Detalle Académico - Profesor
{/snippet}

<div class="mx-auto max-w-7xl space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<Button
			variant="ghost"
			class="w-fit pl-0 hover:bg-transparent hover:underline"
			onclick={goBack}
		>
			<ChevronLeft class="mr-2 h-4 w-4" />
			Volver a Profesores
		</Button>

		<div class="flex items-center gap-2">
			<span class="text-muted-foreground text-sm font-medium">Semestre:</span>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Button variant="outline" class="w-[140px] justify-between">
						{selectedSemester}
						<ChevronDown class="h-4 w-4 opacity-50" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{#each semesters as semester}
						<DropdownMenuItem onclick={() => (selectedSemester = semester)}>
							{semester}
						</DropdownMenuItem>
					{/each}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<Loader2 class="text-primary h-10 w-10 animate-spin" />
		</div>
	{:else if error}
		<Card class="border-destructive/50 bg-destructive/5">
			<CardContent class="text-destructive flex items-center gap-3 pt-6">
				<AlertCircle class="h-5 w-5" />
				<p>{error}</p>
			</CardContent>
		</Card>
	{:else if details}
		<Card>
			<CardHeader>
				<CardTitle>Carga Lectiva</CardTitle>
			</CardHeader>
			<CardContent>
				{#if details.groups.length === 0}
					<p class="text-muted-foreground text-sm">Sin asignación académica este semestre.</p>
				{:else}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each details.groups as group}
							<div class="bg-card/50 flex items-center justify-between rounded-lg border p-3">
								<div>
									<p class="line-clamp-1 text-sm font-semibold" title={group.courseName}>
										{group.courseName}
									</p>
									<p class="text-muted-foreground text-xs capitalize">
										{group.groupType} - Grupo {group.groupLetter}
									</p>
								</div>
								<Users class="text-muted-foreground h-4 w-4" />
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>

		{#if details.schedule.length > 0}
			<div class="bg-card relative overflow-auto rounded-lg border shadow-sm">
				<div
					class="grid min-w-[1000px]"
					style="grid-template-columns: auto repeat(5, 1fr);
					grid-template-rows: auto repeat({timeSlots.length}, 4.5rem);"
				>
					<div
						class="bg-muted/50 text-muted-foreground sticky top-0 z-10 border-b border-r p-3 text-center font-semibold"
					>
						Hora
					</div>
					{#each days as day}
						<div
							class="bg-muted/50 text-muted-foreground sticky top-0 z-10 border-b border-r p-3 text-center font-semibold last:border-r-0"
						>
							{day}
						</div>
					{/each}

					{#each timeSlots as time, i}
						<div
							class="text-muted-foreground border-r p-3 text-right text-sm font-medium"
							style="grid-row-start: {i + 2};"
						>
							{time}
						</div>
						{#each days as day, j}
							<div
								class="border-b border-r last:border-r-0"
								style="grid-row-start: {i + 2}; grid-column-start: {j + 2};"
							></div>
						{/each}
					{/each}

					{#each details.schedule as item}
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
										? 'border-blue-200 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
										: 'border-teal-200 bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200'} border"
									style="grid-column-start: {col}; grid-row-start: {rowStart}; grid-row-span: {rowSpan};"
								>
									<span class="line-clamp-2 text-sm font-bold leading-tight">{item.courseName}</span
									>
									<div class="text-muted-foreground/80 flex items-center gap-1.5">
										<MapPin class="h-3 w-3 shrink-0" />
										<span>{item.classroomName}</span>
									</div>
								</HoverCard.Trigger>

								<HoverCard.Content class="w-80" side="right" align="start">
									<div class="space-y-4 p-2">
										<div class="flex items-start gap-3">
											<BookCopy class="text-muted-foreground h-5 w-5 shrink-0" />
											<div>
												<h3 class="text-muted-foreground text-sm font-medium">Curso</h3>
												<p class="text-foreground">{item.courseName}</p>
											</div>
										</div>
										<div class="flex items-start gap-3">
											<CalendarDays class="text-muted-foreground h-5 w-5 shrink-0" />
											<div>
												<h3 class="text-muted-foreground text-sm font-medium">Día y Hora</h3>
												<p class="text-foreground">{item.day} {item.startTime} - {item.endTime}</p>
											</div>
										</div>
									</div>
								</HoverCard.Content>
							</HoverCard.Root>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>
