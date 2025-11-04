<script lang="ts">
	import DashboardLayout from '$lib/components/common/DashboardLayout.svelte';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import { type NavItem } from '$lib/components/config/types';
	import { page } from '$app/state';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { professorNavGroups } from '$lib/components/config/professorNav';
	let { children } = $props();

	type BreadcrumbPart = {
		title: string;
		href?: string;
	};

	const currentPath = $derived(page.url.pathname);
	const activeParts = $derived.by(() => {
		const parts: BreadcrumbPart[] = [];
		let activeItem: NavItem | undefined;
		let activeGroupTitle: string | undefined;

		for (const group of professorNavGroups) {
			activeItem = group.items.find((item) => currentPath.startsWith(item.url));
			if (activeItem) {
				activeGroupTitle = group.title;
				break;
			}
		}

		if (activeGroupTitle) {
			parts.push({ title: activeGroupTitle });
		}

		if (activeItem) {
			parts.push({ title: activeItem.title, href: activeItem.url });
		}

		return parts;
	});
</script>

<DashboardLayout>
	{#snippet sidebar()}
		<AppSidebar navGroups={professorNavGroups} />
	{/snippet}

	{#snippet headerContent()}
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/dashboard/professor">Profesor</Breadcrumb.Link>
				</Breadcrumb.Item>

				{#each activeParts as part, i}
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						{#if i === activeParts.length - 1 && !part.href}
							<Breadcrumb.Page>{part.title}</Breadcrumb.Page>
						{:else}
							<Breadcrumb.Link href={part.href}>{part.title}</Breadcrumb.Link>
						{/if}
					</Breadcrumb.Item>
				{/each}
			</Breadcrumb.List>
		</Breadcrumb.Root>
	{/snippet}

	{@render children?.()}
</DashboardLayout>
