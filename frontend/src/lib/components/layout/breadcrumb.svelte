<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { cn } from '$lib/utils/cn';
	import type { Crumb } from '$lib/components/config/nav/nav.types';
	import { ChevronRight } from '@lucide/svelte';

	interface Props {
		items: Crumb[];
		class?: string;
	}
	let { items, class: className }: Props = $props();
</script>

<Breadcrumb.Root class={cn('text-sm text-muted-foreground', className)}>
	<Breadcrumb.List>
		{#each items as item, i}
			<Breadcrumb.Item>
				{#if item.href}
					<Breadcrumb.Link href={item.href} class="transition-colors hover:text-primary"
						>{item.label}</Breadcrumb.Link
					>
				{:else}
					<Breadcrumb.Page class="font-medium text-foreground">{item.label}</Breadcrumb.Page>
				{/if}
			</Breadcrumb.Item>

			{#if i < items.length - 1}
				<Breadcrumb.Separator>
					<ChevronRight class="h-4 w-4" />
				</Breadcrumb.Separator>
			{/if}
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
