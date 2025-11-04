<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { CreateUserRequest } from '$lib/core/services/types';

	let { data = $bindable() } = $props<{ data: CreateUserRequest }>();
</script>

<Card.Root class="w-full max-w-2xl">
	<Card.Header>
		<Card.Title>Crear Nuevo Estudiante</Card.Title>
		<Card.Description>Ingresa la información del estudiante para crear su cuenta.</Card.Description>
	</Card.Header>
	<Card.Content>
		<Field.Group class="grid gap-6">
			<Field.Field>
				<Field.Label>Nombre</Field.Label>
				<Input bind:value={data.name} placeholder="John" required />
			</Field.Field>

			<Field.Field>
				<Field.Label>Apellido</Field.Label>
				<Input bind:value={data.surname} placeholder="Doe" required />
			</Field.Field>

			<Field.Field>
				<Field.Label>Email</Field.Label>
				<Input bind:value={data.email} type="email" placeholder="ejemplo@unsa.edu.pe" required />
			</Field.Field>

			<Field.Field>
				<Field.Label>Contraseña</Field.Label>
				<Input bind:value={data.password} type="password" required />
			</Field.Field>

			<Field.Field>
				<Field.Label>Fecha de Nacimiento</Field.Label>
				<Input bind:value={data.birthdate} type="date" required />
			</Field.Field>
		</Field.Group>
	</Card.Content>
	<Card.Footer>
		<Button type="submit" class="ml-auto">Crear Estudiante</Button>
	</Card.Footer>
</Card.Root>
