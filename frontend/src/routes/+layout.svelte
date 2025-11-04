<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import Footer from '$lib/components/common/Footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import { AuthService } from '$lib/core/services';
	import userStore from '$lib/core/stores/user.store';
	import { roleRedirect } from '$lib/core/utils/navigation';
	import { Toaster } from 'svelte-sonner';

	let { children } = $props();
	const user = $derived($userStore);

	function handleLogout() {
		userStore.logout();
	}

	$effect.pre(() => {
		if (browser) {
			const token = localStorage.getItem('authToken');
			if (token) {
				console.log('Restoring session from token...');
				AuthService.getProfile()
					.then((userProfile) => {
						userStore.setUser(userProfile);
						console.log('Session restored:', userProfile.email);
					})
					.catch((error) => {
						console.warn('Session restore failed:', error.message);
						userStore.logout();
					});
			} else {
				userStore.logout();
			}
		}
	});
</script>

<ModeWatcher defaultMode="system" />
<div class="flex min-h-screen flex-col">
	<Navbar>
		{#snippet right()}
			{#if user}
				<Button onclick={handleLogout} variant="outline">Logout</Button>
				<Button onclick={() => roleRedirect(user.role)} variant="outline">Dashboard</Button>
			{:else}
				<Button href={resolve('/login')} variant="outline">Login</Button>
			{/if}
		{/snippet}
	</Navbar>

	<main class="flex-1">
		{@render children()}
	</main>
	<Toaster position="top-right" richColors />

	<Footer />
</div>
