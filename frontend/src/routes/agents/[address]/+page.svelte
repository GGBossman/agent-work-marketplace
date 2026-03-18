<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fetchAgent, fetchCompletedJobsByAgent } from '$lib/contracts/hooks';
	import type { Agent, Job } from '$lib/types';
	import { truncateAddress, formatEth, timeAgo } from '$lib/utils/format';
	import TierBadge from '$lib/components/TierBadge.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let agent = $state<Agent | null>(null);
	let completedJobs = $state<Job[]>([]);
	let loading = $state(true);

	onMount(async () => {
		const address = $page.params.address;
		agent = await fetchAgent(address);
		if (agent) completedJobs = await fetchCompletedJobsByAgent(address);
		loading = false;
	});
</script>

<div>
	{#if loading}
		<p class="text-text-muted">Loading agent profile...</p>
	{:else if !agent}
		<div class="text-center py-12">
			<p class="text-text-muted text-lg">Agent not found.</p>
			<a href="/agents" class="mt-4 inline-block text-primary hover:text-primary-light">← Back to agents</a>
		</div>
	{:else}
		<div class="mb-6 flex items-start justify-between">
			<div>
				<div class="flex items-center gap-3">
					<h1 class="text-3xl font-bold">{agent.name ?? 'Agent'}</h1>
					<TierBadge tier={agent.tier} />
					{#if agent.isAvailable}
						<span class="flex items-center gap-1 text-sm text-success">
							<span class="h-2 w-2 rounded-full bg-success"></span> Available
						</span>
					{:else}
						<span class="flex items-center gap-1 text-sm text-text-muted">
							<span class="h-2 w-2 rounded-full bg-text-muted"></span> Busy
						</span>
					{/if}
				</div>
				<p class="mt-1 font-mono text-text-muted">{agent.address}</p>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Completed</p>
				<p class="text-2xl font-bold text-success">{agent.completedJobs}</p>
			</div>
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Active</p>
				<p class="text-2xl font-bold text-primary">{agent.activeJobs}</p>
			</div>
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Disputed</p>
				<p class="text-2xl font-bold text-danger">{agent.disputedJobs}</p>
			</div>
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Reputation</p>
				<p class="text-2xl font-bold text-expert">{agent.reputation ?? '—'}</p>
			</div>
		</div>

		<div class="mt-6 rounded-xl bg-surface p-4">
			<p class="text-sm text-text-muted">Staked</p>
			<p class="text-lg font-semibold">{formatEth(agent.currentStake)} ETH</p>
		</div>

		{#if agent.skills && agent.skills.length > 0}
			<div class="mt-6">
				<h2 class="mb-3 text-xl font-semibold">Skills</h2>
				<div class="flex flex-wrap gap-2">
					{#each agent.skills as skill}
						<span class="rounded-lg bg-primary/10 border border-primary/30 px-3 py-1 text-sm text-primary-light">{skill}</span>
					{/each}
				</div>
			</div>
		{/if}

		{#if completedJobs.length > 0}
			<div class="mt-8">
				<h2 class="mb-3 text-xl font-semibold">Completed Jobs</h2>
				<div class="space-y-2">
					{#each completedJobs as job}
						<a href="/jobs/{job.jobId}" class="flex items-center justify-between rounded-lg bg-surface p-3 hover:bg-surface-light">
							<div>
								<p class="text-sm font-medium">{job.taskDescription.slice(0, 80)}...</p>
								<p class="text-xs text-text-muted">{timeAgo(job.createdAt)}</p>
							</div>
							<div class="flex items-center gap-2">
								<span class="text-sm font-semibold text-primary">{formatEth(job.escrowAmount)} ETH</span>
								<StatusBadge status={job.status} />
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>
