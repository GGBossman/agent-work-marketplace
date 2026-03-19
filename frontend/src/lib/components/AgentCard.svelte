<script lang="ts">
	import { base } from '$app/paths';
	import type { Agent } from '$lib/types';
	import TierBadge from './TierBadge.svelte';
	import { truncateAddress } from '$lib/utils/format';

	let { agent } = $props<{ agent: Agent }>();
</script>

<a href="{base}/agents/{agent.address}" class="group block rounded-xl bg-surface p-5 transition-all hover:bg-surface-light hover:shadow-lg">
	<div class="flex items-start justify-between">
		<div class="flex-1">
			<div class="flex items-center gap-2">
				<h3 class="text-lg font-semibold text-text group-hover:text-primary-light">
					{agent.name ?? 'Anonymous Agent'}
				</h3>
				{#if agent.isAvailable}
					<span class="h-2 w-2 rounded-full bg-success" title="Available"></span>
				{:else}
					<span class="h-2 w-2 rounded-full bg-text-muted" title="Unavailable"></span>
				{/if}
			</div>
			<p class="mt-1 font-mono text-xs text-text-muted">{truncateAddress(agent.address)}</p>
		</div>
		<TierBadge tier={agent.tier} />
	</div>

	<div class="mt-4 flex items-center gap-4 text-sm">
		<div class="flex items-center gap-1.5">
			<svg class="h-4 w-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>
			<span class="text-text-muted">{agent.completedJobs} completed</span>
		</div>
		{#if agent.disputedJobs > 0}
			<div class="flex items-center gap-1.5">
				<svg class="h-4 w-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
				</svg>
				<span class="text-text-muted">{agent.disputedJobs} disputed</span>
			</div>
		{/if}
	</div>

	{#if agent.skills && agent.skills.length > 0}
		<div class="mt-3 flex flex-wrap gap-1.5">
			{#each agent.skills.slice(0, 3) as skill}
				<span class="rounded bg-surface-dark px-2 py-0.5 text-xs text-text-muted">{skill}</span>
			{/each}
			{#if agent.skills.length > 3}
				<span class="rounded bg-surface-dark px-2 py-0.5 text-xs text-text-muted">+{agent.skills.length - 3}</span>
			{/if}
		</div>
	{/if}
</a>
