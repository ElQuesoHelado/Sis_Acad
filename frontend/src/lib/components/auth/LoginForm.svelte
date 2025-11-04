<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { FieldGroup, Field, FieldLabel } from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import userStore from '$lib/core/stores/user.store';
	import { AuthService } from '$lib/core/services';
	import { preventDefault } from '$lib/core/utils/events';
	import { toast } from 'svelte-sonner';
	import { roleRedirect } from '$lib/core/utils/navigation';
	let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();

	let email = $state('');
	let password = $state('');

	async function loginProcess() {
		try {
			await AuthService.login({ email, password });
			const fullUserProfile = await AuthService.getProfile();

			userStore.setUser(fullUserProfile);
			console.log('Full profile stored:', fullUserProfile);

			return fullUserProfile;
		} catch (error: unknown) {
			console.error('Login or Profile Fetch failed:', error);
			userStore.logout();

			if (error instanceof Error) {
				throw new Error(error.message);
			} else {
				throw new Error('Ocurrió un error inesperado.');
			}
		}
	}
	function handleSubmit() {
		const promise = loginProcess();

		toast.promise(promise, {
			loading: 'Iniciando sesión...',
			success: (user) => {
				roleRedirect(user.role);
				return '¡Inicio de sesión exitoso! Redirigiendo...';
			},
			error: (error) => {
				if (error instanceof Error) {
					return error.message;
				}
				return 'Ocurrió un error inesperado.';
			}
		});
	}
</script>

<div class={cn('flex flex-col gap-6', className)} {...restProps}>
	<Card.Root class="overflow-hidden p-0">
		<Card.Content class="grid p-0 md:grid-cols-2">
			<form class="p-6 md:p-8" onsubmit={preventDefault(handleSubmit)}>
				<FieldGroup>
					<div class="flex flex-col items-center gap-2 text-center">
						<h1 class="text-2xl font-bold">Iniciar Sesión</h1>
						<p class="text-balance text-muted-foreground">
							Inicia sesión en el sistema acádemico de la UNSA
						</p>
					</div>
					<Field>
						<FieldLabel for="email">Email</FieldLabel>
						<Input
							id="email"
							bind:value={email}
							type="email"
							placeholder="example@unsa.edu.pe"
							required
						/>
					</Field>
					<Field>
						<div class="flex items-center">
							<FieldLabel for="password">Contraseña</FieldLabel>
						</div>
						<Input id="password" bind:value={password} type="password" required />
					</Field>
					<Field>
						<Button type="submit">Iniciar Sesión</Button>
					</Field>
				</FieldGroup>
			</form>
			<div class="relative hidden bg-muted md:block">
				<img
					src="/assets/banner.jpg"
					alt="placeholder"
					class="dark absolute inset-0 h-full w-full object-cover dark:brightness-[0.4]"
				/>
			</div>
		</Card.Content>
	</Card.Root>
</div>
