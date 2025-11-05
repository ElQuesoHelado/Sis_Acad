<script lang="ts">
	import type { NavGroup } from '$lib/components/config/nav/nav.types';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils/cn';
	import { APP_PATHS } from '$lib/utils/app-paths';
	import { GraduationCap } from '@lucide/svelte';
	interface Props {
		navGroups: NavGroup[];
		class?: string;
	}
	let { navGroups, class: className }: Props = $props();
</script>

<aside
	class={cn('hidden h-screen w-64 shrink-0 border-r bg-muted/30 md:flex md:flex-col', className)}
>
	<div class="flex h-16 items-center border-b px-6">
		<a href={APP_PATHS.DASHBOARD} class="flex items-center gap-2 font-semibold">
			<GraduationCap class="h-6 w-6 text-primary" />
			<span>UNSA Académico</span>
		</a>
	</div>

	<nav class="flex-1 space-y-4 p-4">
		{#each navGroups as group}
			<div class="space-y-1">
				{#if group.title}
					<h3 class="px-2 text-xs font-semibold text-muted-foreground uppercase">
						{group.title}
					</h3>
				{/if}

				{#each group.items as item}
					<Button href={item.url} variant="ghost" class="w-full justify-start gap-2">
						{#if item.icon}
							<item.icon class="h-4 w-4" />
						{/if}
						{item.title}
					</Button>
				{/each}
			</div>
		{/each}
	</nav>
</aside>
