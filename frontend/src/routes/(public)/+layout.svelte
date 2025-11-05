<script lang="ts">
	import type { Snippet } from 'svelte';
	import PublicNavbar from '$lib/components/layout/public-navbar.svelte';
	import PublicFooter from '$lib/components/layout/public-footer.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="relative flex min-h-screen flex-col bg-background">
	<PublicNavbar class="px-2"/>

	<main class="flex-1">
		{@render children()}
	</main>

	<PublicFooter />
</div>
