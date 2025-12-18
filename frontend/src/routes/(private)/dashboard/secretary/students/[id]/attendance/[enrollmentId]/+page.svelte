<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { secretaryService } from '$lib/core/services';
	import type { StudentAttendanceReport } from '$lib/core/domain/student.types';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Loader2, AlertCircle, CalendarCheck, ChevronLeft } from '@lucide/svelte';
	import { APP_PATHS } from '$lib/utils/app-paths';

	let userId = $derived(page.params.id);
	let enrollmentId = $derived(page.params.enrollmentId);

	let report: StudentAttendanceReport | null = $state(null);
	let loading = $state(true);
	let error = $state('');

	$effect(() => {
		async function load() {
			if (!enrollmentId) return;
			loading = true;
			try {
				report = await secretaryService.getAttendanceReport(enrollmentId);
			} catch (err) {
				error = err instanceof Error ? err.message : 'Error al cargar asistencia';
			} finally {
				loading = false;
			}
		}
		load();
	});

	function goBack() {
		goto(`${APP_PATHS.SECRETARY.STUDENTS}/${userId}/attendance`);
	}

	function getStatusColor(status: string) {
		return status === 'presente'
			? 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
			: 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
	}
</script>

<div class="mx-auto max-w-5xl space-y-6">
	<Button variant="ghost" class="pl-0" onclick={goBack}>
		<ChevronLeft class="mr-2 h-4 w-4" />
		Volver a Cursos
	</Button>

	{#if loading}
		<div class="flex justify-center py-12">
			<Loader2 class="text-primary h-10 w-10 animate-spin" />
		</div>
	{:else if error}
		<div class="text-destructive flex gap-2"><AlertCircle /> {error}</div>
	{:else if report}
		<div class="space-y-1">
			<h1 class="text-3xl font-bold">Reporte de Asistencia</h1>
			<p class="text-muted-foreground text-xl">{report.courseName}</p>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<Card>
				<CardContent class="pt-6 text-center">
					<p class="text-muted-foreground text-sm font-medium">Porcentaje</p>
					<p
						class="mt-2 text-4xl font-bold {report.percentage < 70
							? 'text-destructive'
							: 'text-green-600'}"
					>
						{report.percentage}%
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent class="pt-6 text-center">
					<p class="text-muted-foreground text-sm font-medium">Asistencias</p>
					<p class="mt-2 text-4xl font-bold">{report.totalAssists}</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent class="pt-6 text-center">
					<p class="text-muted-foreground text-sm font-medium">Faltas</p>
					<p class="text-muted-foreground mt-2 text-4xl font-bold">{report.totalAbsences}</p>
				</CardContent>
			</Card>
		</div>

		<Card>
			<CardHeader><CardTitle>Historial de Sesiones</CardTitle></CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Fecha</TableHead>
							<TableHead>Día</TableHead>
							<TableHead>Tipo</TableHead>
							<TableHead class="text-right">Estado</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each report.details as item}
							<TableRow>
								<TableCell class="flex items-center gap-2 font-medium">
									<CalendarCheck class="text-muted-foreground h-4 w-4" />
									{item.date}
								</TableCell>
								<TableCell>{item.dayOfWeek}</TableCell>
								<TableCell class="capitalize">{item.classType}</TableCell>
								<TableCell class="text-right">
									<span
										class="rounded-md px-2 py-1 text-xs font-bold uppercase {getStatusColor(
											item.status
										)}"
									>
										{item.status}
									</span>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	{/if}
</div>
