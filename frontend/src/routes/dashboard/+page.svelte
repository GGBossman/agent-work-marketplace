<script lang="ts">
	import { onMount } from 'svelte';
	import { walletState } from '$lib/stores/wallet.svelte';
	import { fetchJobs, fetchAgents } from '$lib/contracts/hooks';
	import type { Job, Agent } from '$lib/types';
	import { JobStatus } from '$lib/types';
	import { formatEth } from '$lib/utils/format';
	import JobCard from '$lib/components/JobCard.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let activeTab = $state<'buyer' | 'agent'>('buyer');
	let jobs = $state<Job[]>([]);
	let agents = $state<Agent[]>([]);
	let loading = $state(true);

	let buyerJobs = $derived(jobs.filter(j => j.buyer.startsWith('0xaaaa') || j.buyer.startsWith('0xbbbb')));
	let agentJobs = $derived(jobs.filter(j => j.agent !== '0x0000000000000000000000000000000000000000'));

	let totalEscrow = $derived(buyerJobs.reduce((sum, j) => sum + j.escrowAmount, BigInt(0)));
	let completedCount = $derived(jobs.filter(j => j.status === JobStatus.Complete).length);
	let activeCount = $derived(jobs.filter(j => j.status === JobStatus.InProgress || j.status === JobStatus.Assigned).length);

	onMount(async () => {
		jobs = await fetchJobs();
		agents = await fetchAgents();
		loading = false;
	});
</script>

<div>
	<h1 class="mb-6 text-3xl font-bold">Dashboard</h1>

	{#if !walletState.connected}
		<div class="rounded-xl bg-surface p-8 text-center">
			<p class="text-lg text-text-muted mb-4">Connect your wallet to view your dashboard.</p>
			<appkit-button></appkit-button>
		</div>
	{:else if loading}
		<p class="text-text-muted">Loading dashboard...</p>
	{:else}
		<div class="grid grid-cols-3 gap-4 mb-8">
			<div class="rounded-xl bg-surface p-5">
				<p class="text-sm text-text-muted">Total Jobs</p>
				<p class="text-3xl font-bold text-primary">{jobs.length}</p>
			</div>
			<div class="rounded-xl bg-surface p-5">
				<p class="text-sm text-text-muted">Completed</p>
				<p class="text-3xl font-bold text-success">{completedCount}</p>
			</div>
			<div class="rounded-xl bg-surface p-5">
				<p class="text-sm text-text-muted">Active</p>
				<p class="text-3xl font-bold text-warning">{activeCount}</p>
			</div>
		</div>

		<div class="mb-6 flex gap-2">
			<button onclick={() => activeTab = 'buyer'}
				class="rounded-lg px-4 py-2 text-sm font-semibold {activeTab === 'buyer' ? 'bg-primary text-white' : 'bg-surface text-text-muted hover:bg-surface-light'}">
				As Buyer
			</button>
			<button onclick={() => activeTab = 'agent'}
				class="rounded-lg px-4 py-2 text-sm font-semibold {activeTab === 'agent' ? 'bg-primary text-white' : 'bg-surface text-text-muted hover:bg-surface-light'}">
				As Agent
			</button>
		</div>

		{#if activeTab === 'buyer'}
			<div>
				<div class="mb-4 rounded-xl bg-surface-dark p-4">
					<p class="text-sm text-text-muted">Total escrowed: <span class="font-bold text-primary">{formatEth(totalEscrow)} ETH</span></p>
				</div>
				{#if buyerJobs.length === 0}
					<p class="text-text-muted">No jobs posted yet.</p>
				{:else}
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
						{#each buyerJobs as job (job.jobId)}
							<JobCard {job} />
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<div>
				{#if agentJobs.length === 0}
					<p class="text-text-muted">No assignments yet.</p>
				{:else}
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
						{#each agentJobs as job (job.jobId)}
							<JobCard {job} />
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>
