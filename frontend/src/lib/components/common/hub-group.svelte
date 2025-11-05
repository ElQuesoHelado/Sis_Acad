<script lang="ts">
	import type { HubGroup } from '$lib/components/config/hub/hub.types';
	import HubCard from './hub-card.svelte';

	let { group }: { group: HubGroup } = $props();
</script>

<section class="space-y-4">
	<h2 class="text-2xl font-semibold tracking-tight">{group.title}</h2>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each group.items as item}
			<HubCard {item} />
		{/each}
	</div>
</section>
