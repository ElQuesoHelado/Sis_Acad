<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { NavGroup } from '$lib/components/config/nav/nav.types';
	import { cn } from '$lib/utils/cn';
	import { APP_PATHS } from '$lib/utils/app-paths';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import ProfileDropdown from '$lib/components/layout/profile-dropdown.svelte';
	import ThemeToggle from '$lib/components/layout/theme-toggle.svelte';
	import { GraduationCap, Menu } from '@lucide/svelte';

	import { userService } from '$lib/core/services/user.service';
	import type { UserRole } from '$lib/core/domain/enums';
	import { userRoleStore } from '$lib/core/stores/user.store';

	export interface UserProfile {
		name: string;
		surname: string;
		email: string;
		role: UserRole;
	}

	let user: UserProfile | null = $state(null);

	$effect(() => {
		async function loadProfile() {
			try {
				user = await userService.getProfile();
			} catch (err) {
				console.error('Error loading user profile:', err);
				user = null;
			}
		}
		loadProfile();
	});

	interface Props {
		navGroups: NavGroup[];
		title?: Snippet;
		breadcrumb?: Snippet;
		actions?: Snippet;
		class?: string;
	}
	let { navGroups, title, breadcrumb, actions, class: className }: Props = $props();

	let isSheetOpen = $state(false);
</script>

<header
	class={cn(
		'sticky top-0 z-40 flex h-16 w-full items-center gap-4 border-b bg-background px-4 sm:px-6',
		className
	)}
>
	<div class="md:hidden">
		<Sheet.Root bind:open={isSheetOpen}>
			<Sheet.Trigger class={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}>
				<Menu class="h-5 w-5" />
				<span class="sr-only">Abrir menú</span>
			</Sheet.Trigger>
			<Sheet.Content side="left" class="flex flex-col p-0">
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
								<Button
									href={item.url}
									variant="ghost"
									class="w-full justify-start gap-2"
									onclick={() => (isSheetOpen = false)}
								>
									{#if item.icon}
										<item.icon class="h-4 w-4" />
									{/if}
									{item.title}
								</Button>
							{/each}
						</div>
					{/each}
				</nav>
			</Sheet.Content>
		</Sheet.Root>
	</div>

	<div class="flex-1">
		<h1 class="text-lg font-semibold sm:text-xl">
			{#if title}
				{@render title()}
			{:else}
				Panel de {$userRoleStore}
			{/if}
		</h1>
		{#if breadcrumb}
			{@render breadcrumb()}
		{/if}
	</div>

	<div class="flex items-center gap-2">
		{#if actions}
			<div class="hidden sm:flex sm:items-center sm:gap-2">
				{@render actions()}
			</div>
		{/if}

		{#if user}
			<div class="hidden text-right sm:block">
				<p class="text-sm leading-none font-medium">
					{user.name}
					{user.surname}
				</p>
				<p class="text-xs text-muted-foreground">
					{user.email}
				</p>
			</div>
		{/if}

		<ProfileDropdown />
		<ThemeToggle />
	</div>
</header>
