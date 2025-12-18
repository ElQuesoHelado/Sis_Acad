<script lang="ts">
	import HubGroup from '$lib/components/common/hub-group.svelte';
	import { secretaryHubGroups } from '$lib/components/config/hub/secretary.hub';
</script>

<div class="flex flex-1 flex-col gap-8 p-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Panel de Secretaria</h1>
		<p class="text-muted-foreground">Bienvenido al sistema de gestión académica.</p>
	</div>

	<div class="space-y-8">
		{#each secretaryHubGroups as group}
			<HubGroup {group} />
		{/each}
	</div>
</div>
