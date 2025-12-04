<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { adminService } from '$lib/core/services';
	import { UserRole } from '$lib/core/domain';
	import type { AdminUserListEntry } from '$lib/core/domain/admin.types';
	import { APP_PATHS } from '$lib/utils/app-paths';

	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent} from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Search, Loader2, UserCog, Eye } from '@lucide/svelte';

	let users: AdminUserListEntry[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');

	// Filtro reactivo: Busca en nombre, apellido o email
	const filteredUsers = $derived(
		users.filter((u) => {
			const search = searchTerm.toLowerCase();
			return (
				u.name.toLowerCase().includes(search) ||
				u.surname.toLowerCase().includes(search) ||
				u.email.toLowerCase().includes(search) ||
				u.role.toLowerCase().includes(search)
			);
		})
	);

	onMount(async () => {
		try {
			loading = true;
			users = await adminService.getAllUsers();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al cargar usuarios';
		} finally {
			loading = false;
		}
	});

	// Función para navegar al detalle según el rol
	function handleViewDetails(user: AdminUserListEntry) {
		const semester = '2024-I'; // Por defecto, podrías hacerlo dinámico
		if (user.role === UserRole.PROFESSOR) {
			goto(`${APP_PATHS.ADMIN.USERS}/teacher/${user.id}?semester=${semester}`);
		} else if (user.role === UserRole.STUDENT) {
			goto(`${APP_PATHS.ADMIN.USERS}/student/${user.id}?semester=${semester}`);
		}
	}

	// Helpers visuales
	function getRoleBadgeVariant(role: UserRole) {
		switch (role) {
			case UserRole.ADMIN: return 'destructive';
			case UserRole.PROFESSOR: return 'default'; // Primary color
			case UserRole.STUDENT: return 'secondary';
			default: return 'outline';
		}
	}
</script>

{#snippet title()}
	Gestión de Usuarios
{/snippet}

<div class="mx-auto max-w-7xl space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="space-y-1">
			<h2 class="text-2xl font-bold tracking-tight">Directorio Global</h2>
			<p class="text-muted-foreground">
				Visualiza y gestiona el acceso de todos los usuarios del sistema.
			</p>
		</div>
		<div class="relative w-full sm:w-72">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<Search class="h-4 w-4 text-muted-foreground" />
			</div>
			<Input
				type="text"
				placeholder="Buscar usuario..."
				class="pl-9"
				bind:value={searchTerm}
			/>
		</div>
	</div>

	<Card>
		<CardContent class="p-0">
			{#if loading}
				<div class="flex flex-col items-center justify-center py-12">
					<Loader2 class="h-10 w-10 animate-spin text-primary" />
					<p class="mt-4 text-sm text-muted-foreground">Cargando directorio...</p>
				</div>
			{:else if error}
				<div class="flex flex-col items-center justify-center py-12 text-destructive">
					<UserCog class="h-10 w-10 mb-2" />
					<p>{error}</p>
				</div>
			{:else if filteredUsers.length === 0}
				<div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
					<Search class="h-10 w-10 mb-2 opacity-20" />
					<p>No se encontraron usuarios que coincidan con "{searchTerm}"</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[250px]">Usuario</Table.Head>
								<Table.Head>Email</Table.Head>
								<Table.Head>Rol</Table.Head>
								<Table.Head>Estado</Table.Head>
								<Table.Head class="text-right">Acciones</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each filteredUsers as user (user.id)}
								<Table.Row>
									<Table.Cell class="font-medium">
										<div class="flex flex-col">
											<span>{user.surname}, {user.name}</span>
											<span class="text-xs text-muted-foreground md:hidden">{user.email}</span>
										</div>
									</Table.Cell>
									<Table.Cell class="hidden md:table-cell">{user.email}</Table.Cell>
									<Table.Cell>
										<Badge variant={getRoleBadgeVariant(user.role)} class="capitalize">
											{user.role}
										</Badge>
									</Table.Cell>
									<Table.Cell>
										{#if user.status}
											<Badge variant="outline" class="border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20">
												Activo
											</Badge>
										{:else}
											<Badge variant="outline" class="border-muted-foreground text-muted-foreground">
												Inactivo
											</Badge>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-right">
										{#if user.role === UserRole.PROFESSOR || user.role === UserRole.STUDENT}
											<Button 
												variant="ghost" 
												size="icon" 
												onclick={() => handleViewDetails(user)}
												title="Ver Detalle Académico"
											>
												<Eye class="h-4 w-4" />
											</Button>
										{/if}
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
