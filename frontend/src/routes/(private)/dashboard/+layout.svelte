<script lang="ts">
	import type { Snippet } from 'svelte';
	import { UserRole } from '$lib/core/domain/enums';
	import DashboardSidebar from '$lib/components/layout/dashboard-sidebar.svelte';
	import DashboardHeader from '$lib/components/layout/dashboard-header.svelte';
	import { studentNavGroups } from '$lib/components/config/nav/student.nav';
	import { teacherNavGroups } from '$lib/components/config/nav/teacher.nav';

	import { page } from '$app/state';
	import Breadcrumb from '$lib/components/layout/breadcrumb.svelte';
	import { buildCrumbs } from '$lib/utils/breadcrumb-builder';

	interface Props {
		children: Snippet;
		data: { userRole: UserRole };
		title?: Snippet;
		actions?: Snippet;
	}
	let { children, data, title, actions }: Props = $props();

	const navConfig = $derived(() => {
		switch (data.userRole) {
			case UserRole.STUDENT:
				return studentNavGroups;
			case UserRole.PROFESSOR:
				return teacherNavGroups;
			default:
				return [];
		}
	});

	const crumbs = $derived(buildCrumbs(page.url.pathname));
</script>

<div class="flex min-h-screen w-full">
	<DashboardSidebar class="bg-muted/50" navGroups={navConfig()} />

	<div class="flex flex-1 flex-col">
		<DashboardHeader class="bg-muted/40" navGroups={navConfig()} {title} {actions}>
			{#snippet breadcrumb()}
				{#if crumbs.length > 0}
					<Breadcrumb items={crumbs} />
				{/if}
			{/snippet}
		</DashboardHeader>

		<main class="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6">
			{@render children()}
		</main>
	</div>
</div>
