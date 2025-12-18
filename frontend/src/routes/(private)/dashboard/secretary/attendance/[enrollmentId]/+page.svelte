<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { studentService } from '$lib/core/services';
	import type { StudentAttendanceReport } from '$lib/core/domain';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	const enrollmentId = page.params.enrollmentId;
	let report = $state<StudentAttendanceReport | null>(null);
	let loading = $state(true);

	onMount(async () => {
		try {
			report = await studentService.getAttendanceReport(enrollmentId as string);
		} catch (e) {
			console.error('Error al obtener reporte:', e);
		} finally {
			loading = false;
		}
	});
</script>

<div class="flex flex-col gap-6 p-8">
	{#if loading}
		<p>Cargando reporte de asistencia...</p>
	{:else if report}
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">{report.courseName}</h1>
				<p class="text-muted-foreground">Reporte detallado de asistencia para el estudiante</p>
			</div>
			<div class="text-right">
				<div class="text-4xl font-bold">{report.percentage}%</div>
				<p class="text-sm text-muted-foreground">Asistencia Total</p>
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			<Card.Root>
				<Card.Header><Card.Title>Total Clases</Card.Title></Card.Header>
				<Card.Content><p class="text-2xl font-bold">{report.totalAssists + report.totalAbsences}</p></Card.Content>
			</Card.Root>
			<Card.Root class="border-green-200 bg-green-50/30">
				<Card.Header><Card.Title class="text-green-700">Asistencias</Card.Title></Card.Header>
				<Card.Content><p class="text-2xl font-bold text-green-700">{report.totalAssists}</p></Card.Content>
			</Card.Root>
			<Card.Root class="border-red-200 bg-red-50/30">
				<Card.Header><Card.Title class="text-red-700">Inasistencias</Card.Title></Card.Header>
				<Card.Content><p class="text-2xl font-bold text-red-700">{report.totalAbsences}</p></Card.Content>
			</Card.Root>
		</div>

		<div class="rounded-md border">
			<table class="w-full text-sm">
				<thead class="bg-muted">
					<tr>
						<th class="p-4 text-left font-medium">Fecha</th>
						<th class="p-4 text-left font-medium">Tipo</th>
						<th class="p-4 text-left font-medium">Aula</th>
						<th class="p-4 text-left font-medium">Estado</th>
					</tr>
				</thead>
				<tbody class="divide-y">
					{#each report.details as session}
						<tr>
							<td class="p-4">{session.date} ({session.dayOfWeek})</td>
							<td class="p-4 uppercase">{session.classType}</td>
							<td class="p-4">{session.classroomName}</td>
							<td class="p-4">
								<Badge variant={session.status === 'presente' ? 'default' : 'destructive'}>
									{session.status}
								</Badge>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p>No se encontró información de asistencia.</p>
	{/if}
</div>
