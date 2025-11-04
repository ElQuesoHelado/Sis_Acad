<script lang="ts">
	import SearchForm from './search-form.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { page } from '$app/state';

	export type NavItem = {
		title: string;
		url: string;
	};
	export type NavGroup = {
		title: string;
		items: NavItem[];
	};

	let {
		ref = $bindable(null),
		navGroups,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		navGroups: NavGroup[];
	} = $props();

	const currentPath = $derived(page.url.pathname);
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<SearchForm />
	</Sidebar.Header>
	<Sidebar.Content>
		{#each navGroups as group (group.title)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={currentPath.startsWith(item.url)}>
									{#snippet child({ props })}
										<a href={item.url} {...props}>{item.title}</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
