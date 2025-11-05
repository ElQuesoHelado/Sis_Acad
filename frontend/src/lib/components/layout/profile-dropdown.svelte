<script lang="ts">
	import { CircleUser, LogOut } from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils/cn';
	import { authService } from '$lib/core/services/auth.service';
	import { goto } from '$app/navigation';
	import { APP_PATHS } from '$lib/utils/app-paths';

	let { class: className = '' }: { class?: string } = $props();

	function handleLogout() {
		authService.logout();
		goto(APP_PATHS.LOGIN, { replaceState: true });
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(
			buttonVariants({ variant: 'secondary', size: 'icon' }),
			'shrink-0 rounded-full',
			className
		)}
	>
		<CircleUser class="h-5 w-5" />
		<span class="sr-only">Alternar menu de usuario</span>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end">
		<DropdownMenu.Item
			onclick={handleLogout}
			class="cursor-pointer text-destructive focus:text-destructive"
		>
			<LogOut class="mr-2 h-4 w-4" />
			<span>Cerrar Sesión</span>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
