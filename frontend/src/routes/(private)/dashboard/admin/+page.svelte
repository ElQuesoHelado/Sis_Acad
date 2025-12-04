<script lang="ts">
	import HubGroup from '$lib/components/common/hub-group.svelte';
	import { adminHubGroups } from '$lib/components/config/hub/admin.hub';
</script>

{#snippet title()}
	Panel de Administración
{/snippet}

<div class="mx-auto w-full max-w-7xl">
	<div class="space-y-8">
		{#each adminHubGroups as group}
			<HubGroup {group} />
		{/each}
	</div>
</div>
