<script lang="ts">
	import type { Snippet } from 'svelte';
	import { UserRole } from '$lib/core/domain/enums';

	import DashboardSidebar from '$lib/components/layout/dashboard-sidebar.svelte';
	import DashboardHeader from '$lib/components/layout/dashboard-header.svelte';

	import { studentNavGroups } from '$lib/components/config/nav/student.nav';
	import { teacherNavGroups } from '$lib/components/config/nav/teacher.nav';

	interface Props {
		children: Snippet;
		data: {
			userRole: UserRole;
		};
		title?: Snippet;
		breadcrumb?: Snippet;
		actions?: Snippet;
	}
	let { children, data, title, breadcrumb, actions }: Props = $props();

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
</script>

<div class="flex min-h-screen w-full">
	<DashboardSidebar navGroups={navConfig()} />

	<div class="flex-1 flex flex-col">
		<DashboardHeader {title} {breadcrumb} {actions} />

		<main class="flex-1 overflow-y-auto p-6">
			{@render children()}
		</main>
	</div>
</div>
