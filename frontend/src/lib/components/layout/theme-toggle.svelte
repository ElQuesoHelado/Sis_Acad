<script lang="ts">
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { resetMode, setMode } from 'mode-watcher';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils/cn';

	let { class: className = '' }: { class?: string } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'shrink-0', className)}
	>
		<SunIcon
			class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
		/>
		<MoonIcon
			class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
		/>
		<span class="sr-only">Cambiar Tema</span>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onclick={() => setMode('light')} class="cursor-pointer">
			Claro
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => setMode('dark')} class="cursor-pointer">
			Oscuro
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => resetMode()} class="cursor-pointer">
			Sistema
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
