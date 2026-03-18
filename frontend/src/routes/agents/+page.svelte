<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchAgents } from '$lib/contracts/hooks';
	import type { Agent } from '$lib/types';
	import { AgentTier } from '$lib/types';
	import AgentCard from '$lib/components/AgentCard.svelte';

	let agents = $state<Agent[]>([]);
	let filtered = $state<Agent[]>([]);
	let loading = $state(true);
	let search = $state('');
	let tierFilter = $state<AgentTier | null>(null);
	let availableOnly = $state(false);

	onMount(async () => {
		agents = await fetchAgents();
		filtered = agents;
		loading = false;
	});

	$effect(() => {
		let result = agents;
		if (search) {
			const q = search.toLowerCase();
			result = result.filter(a =>
				(a.name?.toLowerCase().includes(q)) ||
				a.address.toLowerCase().includes(q) ||
				a.skills?.some(s => s.toLowerCase().includes(q))
			);
		}
		if (tierFilter !== null) {
			result = result.filter(a => a.tier === tierFilter);
		}
		if (availableOnly) {
			result = result.filter(a => a.isAvailable);
		}
		filtered = result;
	});
</script>

<div>
	<h1 class="mb-6 text-3xl font-bold">Browse Agents</h1>

	<div class="mb-6 flex flex-wrap items-center gap-3">
		<input
			type="text"
			bind:value={search}
			placeholder="Search agents or skills..."
			class="rounded-lg bg-surface border border-surface-light px-4 py-2 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
		/>
		<div class="flex gap-2">
			<button onclick={() => tierFilter = null}
				class="rounded-lg px-3 py-1.5 text-sm {tierFilter === null ? 'bg-primary text-white' : 'bg-surface text-text-muted hover:bg-surface-light'}">
				All
			</button>
			<button onclick={() => tierFilter = AgentTier.Apprentice}
				class="rounded-lg px-3 py-1.5 text-sm {tierFilter === AgentTier.Apprentice ? 'bg-apprentice text-dark' : 'bg-surface text-text-muted hover:bg-surface-light'}">
				Apprentice
			</button>
			<button onclick={() => tierFilter = AgentTier.Proven}
				class="rounded-lg px-3 py-1.5 text-sm {tierFilter === AgentTier.Proven ? 'bg-proven text-dark' : 'bg-surface text-text-muted hover:bg-surface-light'}">
				Proven
			</button>
			<button onclick={() => tierFilter = AgentTier.Expert}
				class="rounded-lg px-3 py-1.5 text-sm {tierFilter === AgentTier.Expert ? 'bg-expert text-dark' : 'bg-surface text-text-muted hover:bg-surface-light'}">
				Expert
			</button>
		</div>
		<label class="flex items-center gap-2 text-sm text-text-muted">
			<input type="checkbox" bind:checked={availableOnly} class="rounded" />
			Available only
		</label>
	</div>

	{#if loading}
		<p class="text-text-muted">Loading agents...</p>
	{:else if filtered.length === 0}
		<p class="text-text-muted">No agents match your filters.</p>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each filtered as agent (agent.address)}
				<AgentCard {agent} />
			{/each}
		</div>
	{/if}
</div>
