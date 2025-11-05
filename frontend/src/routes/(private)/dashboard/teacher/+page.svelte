<script lang="ts">
	import HubGroup from '$lib/components/common/hub-group.svelte';
	import { teacherHubGroups } from '$lib/components/config/hub/teacher.hub';
</script>

{#snippet title()}
	Inicio Profesor
{/snippet}

<div class="mx-auto w-full max-w-7xl">
	<div class="space-y-8">
		{#each teacherHubGroups as group}
			<HubGroup {group} />
		{/each}
	</div>
</div>
