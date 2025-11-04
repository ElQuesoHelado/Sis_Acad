<script lang="ts">
	import userStore from '$lib/core/stores/user.store';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let { children } = $props();
	const user = $derived($userStore);

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
