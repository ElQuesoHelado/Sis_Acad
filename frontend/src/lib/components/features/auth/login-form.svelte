<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		FieldGroup,
		Field,
		FieldLabel,
	} from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { cn } from '$lib/utils/cn';
	import { ScanFace } from '@lucide/svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	interface Props extends HTMLAttributes<HTMLDivElement> {
		onsubmit: (e: SubmitEvent) => void;
		isSubmitting?: boolean;
		class?: string;
    oninput?: (e: Event) => void;
	}
	let {
		class: className,
		onsubmit,
    oninput,
		isSubmitting = false,
		...restProps
	}: Props = $props();
	const id = $props.id();
</script>

<div class={cn('flex flex-col gap-6', className)} {...restProps}>
	<Card.Root>
		<div class="flex justify-center pt-6">
			<div class="rounded-full bg-primary p-4 text-primary-foreground">
				<ScanFace class="h-10 w-10" />
			</div>
		</div>

		<Card.Header class="text-center">
			<Card.Title class="text-xl">Iniciar Sesión</Card.Title>
			<Card.Description>Ingresa tu email y contraseña para acceder.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={onsubmit} oninput={oninput}>
				<FieldGroup>
					<Field>
						<FieldLabel for="email-{id}">Email</FieldLabel>
						<Input
							id="email-{id}"
							type="email"
							name="email"
							placeholder="usuario@unsa.edu.pe"
							required
							disabled={isSubmitting}
						/>
					</Field>
					<Field>
						<FieldLabel for="password-{id}">Contraseña</FieldLabel>
						<Input
							id="password-{id}"
							type="password"
							name="password"
							required
							disabled={isSubmitting}
						/>
					</Field>
					<Field>
						<Button type="submit" class="w-full" disabled={isSubmitting}>
							{isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
</div>
