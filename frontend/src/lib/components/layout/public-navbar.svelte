<script lang="ts">
	import { BookMarked } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { userRoleStore } from '$lib/core/stores/user.store';
	import { APP_PATHS } from '$lib/utils/app-paths';
	import { cn } from '$lib/utils/cn';

	import ThemeToggle from '$lib/components/layout/theme-toggle.svelte';
	import ProfileDropdown from '$lib/components/layout/profile-dropdown.svelte';
	import { resolve } from '$app/paths';
	import { roleRedirect } from '$lib/utils/navigation';

	let { class: className = '' }: { class?: string } = $props();
</script>

<header class={cn('sticky top-0 z-50 w-full border-b bg-background/95', className)}>
	<nav class="container mx-auto flex h-16 w-full items-center">
		<a href={resolve('/')} class="mr-6 flex items-center space-x-2">
			<BookMarked class="h-6 w-6" />
			<span class="hidden font-bold sm:inline-block">UNSA Sistema Académico</span>
		</a>

		<div class="flex-1"></div>

		<div class="flex items-center gap-x-2">
			{#if $userRoleStore}
				<Button onclick={() => roleRedirect($userRoleStore)} variant="ghost" class="cursor-pointer"
					>Panel</Button
				>
				<ProfileDropdown />
			{:else}
				<Button href={APP_PATHS.LOGIN}>Iniciar Sesión</Button>
			{/if}

			<ThemeToggle />
		</div>
	</nav>
</header>
