<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { House } from '@lucide/svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import { resolve } from '$app/paths';

	let { left, right } = $props<{
		left?: () => unknown;
		right?: () => unknown;
	}>();
</script>

<nav
	class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="flex h-14 items-center px-4 md:px-6">
		<div class="mr-auto flex items-center space-x-2">
			{#if left}
				{@render left()}
			{:else}
				<a href={resolve('/')} class="flex items-center space-x-2">
					<Button variant="ghost" size="icon" aria-label="Ir a Home">
						<House class="h-5 w-5" />
					</Button>
					<span class="hidden font-semibold sm:inline-block">UNSA</span>
				</a>
			{/if}
		</div>
		<div class="ml-auto flex items-center space-x-4">
			{@render right?.()}
			<ThemeToggle />
		</div>
	</div>
</nav>
