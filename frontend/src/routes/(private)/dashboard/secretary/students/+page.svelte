<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { secretaryService } from '$lib/core/services';
	import type { AdminUserListEntry } from '$lib/core/domain/admin.types';
	import { APP_PATHS } from '$lib/utils/app-paths';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Search, Loader2, UserCog, Eye, CalendarCheck } from '@lucide/svelte';

	let students: AdminUserListEntry[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');

	const filteredStudents = $derived(
		students.filter((s) => {
			const search = searchTerm.toLowerCase();
			return (
				s.name.toLowerCase().includes(search) ||
				s.surname.toLowerCase().includes(search) ||
				s.email.toLowerCase().includes(search)
			);
		})
	);

	onMount(async () => {
		try {
			loading = true;

			students = await secretaryService.getStudents();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al cargar estudiantes';
		} finally {
			loading = false;
		}
	});

	function handleViewDetails(student: AdminUserListEntry) {
		const semester = '2024-I';
		goto(`${APP_PATHS.SECRETARY.STUDENTS}/${student.id}?semester=${semester}`);
	}

	function handleViewAttendance(student: AdminUserListEntry) {
		goto(`${APP_PATHS.SECRETARY.STUDENTS}/${student.id}/attendance`);
	}
</script>

{#snippet title()}
	Gestión de Estudiantes
{/snippet}

<div class="mx-auto max-w-7xl space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="space-y-1">
			<h2 class="text-2xl font-bold tracking-tight">Estudiantes</h2>
			<p class="text-muted-foreground">
				Directorio de alumnos matriculados. Gestiona notas y asistencia.
			</p>
		</div>
		<div class="relative w-full sm:w-72">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<Search class="text-muted-foreground h-4 w-4" />
			</div>
			<Input type="text" placeholder="Buscar estudiante..." class="pl-9" bind:value={searchTerm} />
		</div>
	</div>

	<Card>
		<CardContent class="p-0">
			{#if loading}
				<div class="flex flex-col items-center justify-center py-12">
					<Loader2 class="text-primary h-10 w-10 animate-spin" />
					<p class="text-muted-foreground mt-4 text-sm">Cargando directorio...</p>
				</div>
			{:else if error}
				<div class="text-destructive flex flex-col items-center justify-center py-12">
					<UserCog class="mb-2 h-10 w-10" />
					<p>{error}</p>
				</div>
			{:else if filteredStudents.length === 0}
				<div class="text-muted-foreground flex flex-col items-center justify-center py-12">
					<Search class="mb-2 h-10 w-10 opacity-20" />
					<p>No se encontraron estudiantes que coincidan con "{searchTerm}"</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[300px]">Estudiante</Table.Head>
								<Table.Head>Email</Table.Head>
								<Table.Head>Estado</Table.Head>
								<Table.Head class="text-right">Acciones</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each filteredStudents as student (student.id)}
								<Table.Row>
									<Table.Cell class="font-medium">
										<div class="flex flex-col">
											<span>{student.surname}, {student.name}</span>
											<span class="text-muted-foreground text-xs md:hidden">{student.email}</span>
										</div>
									</Table.Cell>
									<Table.Cell class="hidden md:table-cell">{student.email}</Table.Cell>
									<Table.Cell>
										{#if student.status}
											<Badge
												variant="outline"
												class="border-green-500 bg-green-50 text-green-600 dark:bg-green-900/20"
											>
												Activo
											</Badge>
										{:else}
											<Badge variant="destructive">Inactivo</Badge>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-right">
										<div class="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="icon"
												onclick={() => handleViewDetails(student)}
												title="Ver Notas y Cursos"
											>
												<Eye class="h-4 w-4" />
											</Button>

											<Button
												variant="ghost"
												size="icon"
												onclick={() => handleViewAttendance(student)}
												title="Ver Asistencia"
												class="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400"
											>
												<CalendarCheck class="h-4 w-4" />
											</Button>
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
