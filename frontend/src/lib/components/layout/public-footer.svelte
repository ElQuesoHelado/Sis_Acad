<script lang="ts">
	import { cn } from '$lib/utils/cn';

	const currentYear = new Date().getFullYear();
	let { class: className = '' }: { class?: string } = $props();
</script>

<footer class={cn('w-full border-t py-8', className)}>
	<div class="flex w-full items-center justify-center">
		<p class="text-center text-sm text-muted-foreground">
			&copy; {currentYear} UNSA Sistema Académico. Todos los derechos reservados.
		</p>
	</div>
</footer>
