<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import Footer from '$lib/components/common/Footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import { authService } from '$lib/core/api/services';
	import { roleRedirect } from '$lib/core/utils/navigation';
	import { Toaster } from 'svelte-sonner';
	import { userRoleStore } from '$lib/core/stores';

	let { children } = $props();
	const user = $derived($userRoleStore);

	$effect.pre(() => {
		if (!browser) {
			return;
		}
	});
</script>

<ModeWatcher defaultMode="system" />
<div class="flex min-h-screen flex-col">
	<Navbar>
		{#snippet right()}
			{#if user}
				<Button onclick={userRoleStore.clear} variant="outline">Logout</Button>
				<Button onclick={() => roleRedirect(user)} variant="outline">Dashboard</Button>
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
