<script lang="ts">
	import HubGroup from '$lib/components/common/hub-group.svelte';
	import { studentHubGroups } from '$lib/components/config/hub/student.hub';
</script>

{#snippet title()}
	Inicio Estudiante
{/snippet}

<div class="space-y-8">
	{#each studentHubGroups as group}
		<HubGroup {group} />
	{/each}
</div>
