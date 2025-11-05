<script lang="ts">
	import type { NavGroup } from '$lib/components/config/nav/nav.types';
	import { cn } from '$lib/utils/cn';
	import { BookMarked } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	interface Props {
		navGroups: NavGroup[];
		class?: string;
	}
	let { navGroups, class: className }: Props = $props();
</script>

<aside
	class={cn(
		'group hidden h-screen w-16 flex-col overflow-x-hidden border-r bg-background transition-all duration-300 ease-in-out hover:w-64 md:flex',
		className
	)}
>
	<div class="flex h-16 shrink-0 items-center px-4">
		<a href={resolve('/')} class="flex items-center gap-2">
			<div class="flex h-8 w-8 items-center justify-center">
				<BookMarked class="h-6 w-6 text-primary" />
			</div>
			<span
				class="text-lg font-semibold whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			>
				UNSA Académico
			</span>
		</a>
	</div>

	<nav class="flex-1 space-y-2 overflow-y-auto p-2">
		{#each navGroups as group}
			{#if group.title}
				<h3
					class="px-2 pt-2 text-xs font-semibold text-muted-foreground uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				>
					{group.title}
				</h3>
			{/if}

			<ul class="space-y-1">
				{#each group.items as item}
					<li>
						<a
							href={item.url}
							class="flex h-10 items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
						>
							<div class={cn('flex h-6 w-6 items-center justify-center')}>
								{#if item.icon}
									<item.icon class="h-5 w-5" />
								{/if}
							</div>
							<span
								class="text-sm font-medium whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							>
								{item.title}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		{/each}
	</nav>
</aside>
