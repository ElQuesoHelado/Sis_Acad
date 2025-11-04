<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import userStore from '$lib/core/stores/user.store';
	import { roleRedirect } from '$lib/core/utils/navigation';
	const user = $derived($userStore);

	$effect(() => {
		console.log(user);
		if (user && user.role) {
			console.log('User is logged in, redirecting from /login...');
			roleRedirect(user.role);
		}
	});
</script>

<svelte:head>
	<title>Iniciar Sesión - UNSA Sistema Académico</title>
</svelte:head>

<div class="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
	<div class="w-full max-w-sm md:max-w-3xl">
		<LoginForm />
	</div>
</div>
