<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { Snippet } from 'svelte';

	let {
		children,
		sidebar,
		headerContent
	}: {
		children: Snippet;
		sidebar: Snippet;
		headerContent?: Snippet;
	} = $props();
</script>

<Sidebar.Provider>
	{@render sidebar()}

	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 h-4" />

			{#if headerContent}
				{@render headerContent()}
			{/if}
		</header>

		<div class="flex flex-1 flex-col gap-4 p-4">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
