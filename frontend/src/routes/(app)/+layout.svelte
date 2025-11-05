<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { userRoleStore } from '$lib/core/stores';

	let { children } = $props();
	const user = $derived($userRoleStore);

	let loading = $state(true);

	$effect.pre(() => {
		if (browser) {
			if (!user) {
				console.log('No user session, redirecting to /login');
				goto('/login', { replaceState: true });
			} else {
				loading = false;
			}
		}
	});

	$effect(() => {
		if (browser && !user) {
			goto('/login', { replaceState: true });
		}
	});
</script>

{#if !loading && user}
	{@render children()}
{/if}

{#if loading}{/if}
