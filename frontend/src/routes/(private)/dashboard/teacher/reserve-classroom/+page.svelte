<script lang="ts">
	import { classroomService, teacherService } from '$lib/core/services';
	import { preventDefault } from '$lib/utils/events';
	import type { CreateReservationInput, AvailableClassroom } from '$lib/core/domain/teacher.types';

	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as DDropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils/cn';

	import Loader2 from '@lucide/svelte/icons/loader-2';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	let form: CreateReservationInput = $state({
		classroomId: '',
		semester: '2024-I',
		date: '',
		startTime: '',
		endTime: '',
		notes: ''
	});

	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	const semesters = ['2024-I', '2024-II', '2023-II', '2023-I'];

	let classrooms: AvailableClassroom[] = $state([]);
	let loadingClassrooms = $state(false);
	let classroomLoadError = $state<string | null>(null);

	const selectedClassroomName = $derived(
		classrooms.find((c) => c.id === form.classroomId)?.name || 'Seleccionar Salón'
	);

	$effect(() => {
		async function loadClassrooms() {
			loadingClassrooms = true;
			classroomLoadError = null;
			try {
				classrooms = await classroomService.getAllClassrooms();
			} catch (err) {
				classroomLoadError = 'Error al cargar salones disponibles.';
			} finally {
				loadingClassrooms = false;
			}
		}
		loadClassrooms();
	});

	function clearMessages() {
		errorMessage = null;
		successMessage = null;
	}

	async function handleReservation() {
		clearMessages();
		isSubmitting = true;

		if (!form.classroomId || !form.date || !form.startTime || !form.endTime) {
			errorMessage = 'Por favor, complete todos los campos obligatorios.';
			isSubmitting = false;
			return;
		}

		try {
			const data: CreateReservationInput = { ...form };

			const response: CreateReservationInput = await teacherService.createReservation(data);

			if (response.status) {
				successMessage = '¡Reserva de salón realizada con éxito!';

				form = {
					classroomId: '',
					semester: '2024-I',
					date: '',
					startTime: '',
					endTime: '',
					notes: ''
				};
			} else {
				errorMessage = response.message || 'La reserva no pudo ser completada.';
			}
		} catch (err) {
			console.error('Error de reserva:', err);
			errorMessage =
				err instanceof Error ? err.message : 'Error de red o servidor. Intente de nuevo.';
		} finally {
			isSubmitting = false;
			setTimeout(clearMessages, 5000);
		}
	}

	const handleSubmit = preventDefault(handleReservation);
</script>

{#snippet title()}
	Reservar Salón
{/snippet}

<div class="mx-auto max-w-3xl space-y-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>Formulario de Reserva de Salón</Card.Title>
			<Card.Description>
				Solicita la reserva de un salón específico para una sesión académica.
			</Card.Description>
		</Card.Header>

		<Card.Content>
			<form onsubmit={handleSubmit} oninput={clearMessages}>
				<div class="space-y-6">
					{#if successMessage}
						<div
							class="flex items-start gap-3 rounded-md border border-green-500/50 bg-green-500/10 p-4 text-green-700"
						>
							<CheckCircle class="h-5 w-5 shrink-0" />
							<p class="text-sm font-medium">{successMessage}</p>
						</div>
					{/if}
					{#if errorMessage}
						<div
							class="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
						>
							<AlertCircle class="h-5 w-5 shrink-0" />
							<p class="text-sm font-medium">{errorMessage}</p>
						</div>
					{/if}

					{#if classroomLoadError}
						<div
							class="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
						>
							<AlertCircle class="h-5 w-5 shrink-0" />
							<p class="text-sm font-medium">{classroomLoadError}</p>
						</div>
					{/if}

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.Label for="classroom-select">Salón *</Field.Label>
							<DDropdownMenu.Root>
								<DDropdownMenu.Trigger
									class={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between')}
									disabled={isSubmitting || loadingClassrooms || classrooms.length === 0}
									id="classroom-select"
								>
									{#if loadingClassrooms}
										<Loader2 class="h-4 w-4 animate-spin" />
										Cargando salones...
									{:else}
										<span class="truncate">{selectedClassroomName}</span>
										<ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
									{/if}
								</DDropdownMenu.Trigger>
								<DDropdownMenu.Content class="w-(--radix-dropdown-menu-trigger-width)">
									{#each classrooms as classroom}
										<DDropdownMenu.Item
											onclick={() => (form.classroomId = classroom.id)}
											class="truncate"
										>
											{classroom.name}
										</DDropdownMenu.Item>
									{/each}
								</DDropdownMenu.Content>
							</DDropdownMenu.Root>
							<input type="hidden" name="classroomId" bind:value={form.classroomId} required />
						</Field.Field>

						<Field.Field>
							<Field.Label for="semester">Semestre</Field.Label>
							<Input
								id="semester"
								type="text"
								bind:value={form.semester}
								disabled={isSubmitting}
								list="semester-list"
							/>
							<datalist id="semester-list">
								{#each semesters as s}
									<option value={s}>{s}</option>
								{/each}
							</datalist>
						</Field.Field>
					</div>

					<Field.Field>
						<Field.Label for="date">Fecha de la Reserva *</Field.Label>
						<Input id="date" type="date" bind:value={form.date} required disabled={isSubmitting} />
					</Field.Field>

					<div class="grid grid-cols-2 gap-4">
						<Field.Field>
							<Field.Label for="start-time">Hora de Inicio *</Field.Label>
							<Input
								id="start-time"
								type="time"
								placeholder="HH:MM"
								bind:value={form.startTime}
								required
								disabled={isSubmitting}
							/>
						</Field.Field>

						<Field.Field>
							<Field.Label for="end-time">Hora de Fin *</Field.Label>
							<Input
								id="end-time"
								type="time"
								placeholder="HH:MM"
								bind:value={form.endTime}
								required
								disabled={isSubmitting}
							/>
						</Field.Field>
					</div>

					<Field.Field>
						<Field.Label for="notes">Notas / Propósito</Field.Label>
						<textarea
							id="notes"
							rows="3"
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
							bind:value={form.notes}
							disabled={isSubmitting}
						/>
					</Field.Field>

					<Button type="submit" class="w-full" disabled={isSubmitting}>
						{#if isSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Reservando...
						{:else}
							Confirmar Reserva
						{/if}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
