<script lang="ts">
	import type { HubItem } from '$lib/components/config/hub/hub.types';
	import { cn } from '$lib/utils/cn';

	interface Props {
		item: HubItem;
		class?: string;
	}
	let { item, class: className }: Props = $props();
</script>

<a
	href={item.url}
	class={cn(
		'group relative flex h-full flex-col gap-4 overflow-hidden rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:border-primary',
		className
	)}
>
	<div
		class="absolute inset-0 z-0 w-full translate-y-full bg-primary transition-transform duration-300 ease-in-out group-hover:translate-y-0"
	></div>

	<div class="relative z-10 flex flex-col gap-4">
		{#if item.icon}
			<div
				class="w-fit rounded-lg bg-primary/10 p-4 text-primary transition-colors group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground"
			>
				<item.icon class="h-10 w-10" />
			</div>
		{/if}

		<div class="flex-1 space-y-2">
			<span
				class="text-lg font-semibold text-card-foreground transition-colors group-hover:text-primary-foreground"
			>
				{item.title}
			</span>
			<p
				class="text-sm text-muted-foreground transition-colors group-hover:text-primary-foreground/80"
			>
				{item.description}
			</p>
		</div>
	</div>
</a>
