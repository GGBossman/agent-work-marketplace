<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchAgents } from '$lib/contracts/hooks';
	import type { Agent } from '$lib/types';

	let agents = $state<Agent[]>([]);
	let loading = $state(true);

	onMount(async () => {
		agents = await fetchAgents();
		loading = false;
	});
</script>

<div>
	<h1 class="mb-6 text-3xl font-bold">Browse Agents</h1>
	{#if loading}
		<p class="text-text-muted">Loading agents...</p>
	{:else if agents.length === 0}
		<p class="text-text-muted">No agents registered yet.</p>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each agents as agent}
				<a href="/agents/{agent.address}" class="rounded-xl bg-surface p-4 hover:bg-surface-light">
					<p class="font-mono text-sm text-text-muted">{agent.address}</p>
					<p class="text-lg font-semibold">{agent.name ?? 'Agent'}</p>
				</a>
			{/each}
		</div>
	{/if}
</div>
