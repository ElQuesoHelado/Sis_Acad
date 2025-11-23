<script lang="ts">
	import { page } from '$app/state';
	import { studentService } from '$lib/core/services';
	import type { StudentAttendanceReport } from '$lib/core/domain';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Loader2, AlertCircle, CalendarCheck, MapPin } from '@lucide/svelte';

	let enrollmentId = $derived(page.params.enrollmentId);
	let report: StudentAttendanceReport | null = $state(null);
	let loading = $state(true);
	let error = $state('');

	$effect(() => {
		async function load() {
			loading = true;
			try {
				report = await studentService.getAttendanceReport(enrollmentId || '');
			} catch (err) {
				error = err instanceof Error ? err.message : 'Error al cargar asistencia';
			} finally {
				loading = false;
			}
		}
		load();
	});

	function getStatusColor(status: string) {
		return status === 'presente'
			? 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
			: 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
	}
</script>

<div class="mx-auto max-w-5xl space-y-6">
	{#if loading}
		<div class="flex justify-center py-12">
			<Loader2 class="h-10 w-10 animate-spin text-primary" />
		</div>
	{:else if error}
		<div class="flex gap-2 text-destructive"><AlertCircle /> {error}</div>
	{:else if report}
		<div class="space-y-2">
			<h1 class="text-3xl font-bold">Reporte de Asistencia</h1>
			<p class="text-xl text-muted-foreground">{report.courseName}</p>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<Card>
				<CardContent class="pt-6 text-center">
					<p class="text-sm font-medium text-muted-foreground">Porcentaje de Asistencia</p>
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
					<p class="text-sm font-medium text-muted-foreground">Asistencias</p>
					<p class="mt-2 text-4xl font-bold text-foreground">{report.totalAssists}</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent class="pt-6 text-center">
					<p class="text-sm font-medium text-muted-foreground">Faltas</p>
					<p class="mt-2 text-4xl font-bold text-muted-foreground">{report.totalAbsences}</p>
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
							<TableHead>Horario</TableHead>
							<TableHead>Tipo</TableHead>
							<TableHead>Lugar</TableHead>
							<TableHead class="text-right">Estado</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each report.details as item}
							<TableRow>
								<TableCell class="flex items-center gap-2 font-medium">
									<CalendarCheck class="h-4 w-4 text-muted-foreground" />
									{item.date}
								</TableCell>
								<TableCell>{item.dayOfWeek}</TableCell>
								<TableCell>{item.startTime} - {item.endTime}</TableCell>
								<TableCell class="capitalize">{item.classType}</TableCell>
								<TableCell>
									<div class="flex items-center gap-1 text-muted-foreground">
										<MapPin class="h-3 w-3" />
										{item.classroomName}
									</div>
								</TableCell>
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
