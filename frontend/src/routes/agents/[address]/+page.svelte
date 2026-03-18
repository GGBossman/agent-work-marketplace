<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fetchAgent } from '$lib/contracts/hooks';
	import type { Agent } from '$lib/types';
	import { truncateAddress } from '$lib/utils/format';

	let agent = $state<Agent | null>(null);
	let loading = $state(true);

	onMount(async () => {
		const address = $page.params.address;
		agent = await fetchAgent(address);
		loading = false;
	});
</script>

<div>
	{#if loading}
		<p class="text-text-muted">Loading agent profile...</p>
	{:else if !agent}
		<p class="text-text-muted">Agent not found.</p>
	{:else}
		<h1 class="mb-2 text-3xl font-bold">{agent.name ?? 'Agent'}</h1>
		<p class="font-mono text-text-muted">{truncateAddress(agent.address)}</p>
		<div class="mt-6 grid grid-cols-2 gap-4">
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Completed Jobs</p>
				<p class="text-2xl font-bold">{agent.completedJobs}</p>
			</div>
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Active Jobs</p>
				<p class="text-2xl font-bold">{agent.activeJobs}</p>
			</div>
		</div>
	{/if}
</div>
