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
	import { Search, Loader2, Eye } from '@lucide/svelte';

	let teachers: AdminUserListEntry[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');

	const filteredTeachers = $derived(
		teachers.filter((t) => {
			const search = searchTerm.toLowerCase();
			return (
				t.name.toLowerCase().includes(search) ||
				t.surname.toLowerCase().includes(search) ||
				t.email.toLowerCase().includes(search)
			);
		})
	);

	onMount(async () => {
		try {
			loading = true;
			// Llamada específica para profesores
			teachers = await secretaryService.getTeachers();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al cargar profesores';
		} finally {
			loading = false;
		}
	});

	function handleViewDetails(teacher: AdminUserListEntry) {
		const semester = '2024-I';
		goto(`${APP_PATHS.SECRETARY.TEACHERS}/${teacher.id}?semester=${semester}`);
	}
</script>

{#snippet title()}
	Gestión de Profesores
{/snippet}

<div class="mx-auto max-w-7xl space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="space-y-1">
			<h2 class="text-2xl font-bold tracking-tight">Profesores</h2>
			<p class="text-muted-foreground">
				Listado de docentes.
			</p>
		</div>
        <div class="relative w-full sm:w-72">
			<Search class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
			<Input type="text" placeholder="Buscar profesor..." class="pl-9" bind:value={searchTerm} />
		</div>
	</div>

    <Card>
		<CardContent class="p-0">
            {#if loading}
				<div class="flex flex-col items-center justify-center py-12">
					<Loader2 class="h-10 w-10 animate-spin text-primary" />
					<p class="mt-4 text-sm text-muted-foreground">Cargando profesores...</p>
				</div>
			{:else if error}
                <p class="text-destructive text-center p-4">{error}</p>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Docente</Table.Head>
							<Table.Head>Email</Table.Head>
							<Table.Head>Estado</Table.Head>
							<Table.Head class="text-right">Acciones</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each filteredTeachers as teacher (teacher.id)}
							<Table.Row>
								<Table.Cell class="font-medium">{teacher.surname}, {teacher.name}</Table.Cell>
								<Table.Cell>{teacher.email}</Table.Cell>
								<Table.Cell>
									<Badge variant="default">Profesor</Badge>
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button variant="ghost" size="icon" onclick={() => handleViewDetails(teacher)}>
										<Eye class="h-4 w-4" />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</CardContent>
	</Card>
</div>
