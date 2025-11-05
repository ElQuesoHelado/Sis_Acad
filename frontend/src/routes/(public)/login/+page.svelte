<svelte:head>
	<title>Iniciar Sesión - UNSA Sistema Académico</title>
</svelte:head>

<script lang="ts">
	import LoginForm from '$lib/components/features/auth/login-form.svelte';
	import GraduationCap  from '@lucide/svelte/icons/graduation-cap';
	import { authService } from '$lib/core/services/auth.service';
	import { userRoleStore } from '$lib/core/stores/user.store';
	import { roleRedirect } from '$lib/utils/navigation';
	import { goto } from '$app/navigation';
	import { APP_PATHS } from '$lib/utils/app-paths';
	import { preventDefault } from '$lib/utils/events';

	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);
	let errorTimer = $state<unknown | null>(null);

	if ($userRoleStore) {
		goto(APP_PATHS.DASHBOARD, { replaceState: true });
	}

	function clearError() {
		if (errorTimer) {
			clearTimeout(errorTimer as number);
			errorTimer = null;
		}
		errorMessage = null;
	}

	async function handleLogin(event: SubmitEvent) {
		isSubmitting = true;
		clearError();
		const formData = new FormData(event.target as HTMLFormElement);
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		try {
			const session = await authService.login({ email, password });
			roleRedirect(session.role);
		} catch (error) {
			errorMessage = 'Email o contraseña incorrectos.';
			isSubmitting = false;

			errorTimer = setTimeout(() => {
				errorMessage = null;
				errorTimer = null;
			}, 5000);
		}
	}
	const handleSubmit = preventDefault(handleLogin);
</script>

<div class="flex min-h-[calc(100vh-9rem)] flex-col items-center justify-center bg-muted p-6 md:p-10">
	<div class="flex w-full max-w-sm flex-col gap-6">
		<div class="flex items-center gap-2 self-center font-medium">
			<div
				class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"
			>
				<GraduationCap class="size-4" />
			</div>
			UNSA
		</div>

		<LoginForm onsubmit={handleSubmit} oninput={clearError} {isSubmitting} />

		{#if errorMessage}
			<div
				class="rounded-lg border border-destructive bg-destructive/10 p-3 text-center"
			>
				<p class="text-sm font-medium text-destructive">
					{errorMessage}
				</p>
			</div>
		{/if}
	</div>
</div>
