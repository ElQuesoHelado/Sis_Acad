<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import ProfileDropdown from '$lib/components/layout/profile-dropdown.svelte';
	import ThemeToggle from '$lib/components/layout/theme-toggle.svelte';

	interface Props {
		title?: Snippet;
		breadcrumb?: Snippet;
		actions?: Snippet;
		class?: string;
	}
	let {
		title,
		breadcrumb,
		actions,
		class: className
	}: Props = $props();
</script>

<header
	class={cn(
		'sticky top-0 z-40 flex h-16 w-full items-center gap-4 border-b bg-background px-6',
		className
	)}
>
	<div class="flex-1">
		{#if breadcrumb}
			{@render breadcrumb()}
		{/if}

		<h1 class="text-xl font-semibold">
			{#if title}
				{@render title()}
			{:else}
				Dashboard
			{/if}
		</h1>
	</div>

	<div class="flex items-center gap-2">
		{#if actions}
			<div class="hidden sm:flex sm:items-center sm:gap-2">
				{@render actions()}
			</div>
		{/if}

		<ThemeToggle />
		<ProfileDropdown />
	</div>
</header>
