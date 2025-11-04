<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status} | Error</title>
</svelte:head>

<div
	class="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center gap-6 p-6 text-center"
>
	<h1 class="text-[10rem] leading-none font-extrabold text-primary">
		{page.status}
	</h1>

	<p class="text-2xl font-medium text-muted-foreground">
		{page.error?.message ?? 'Página no encontrada'}
	</p>

	<Button href={resolve('/')} size="lg" class="mt-4">Volver al inicio</Button>
</div>
