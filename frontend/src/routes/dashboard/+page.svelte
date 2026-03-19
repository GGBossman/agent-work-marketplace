<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { walletState } from '$lib/stores/wallet.svelte';
	import { fetchJobs, fetchAgent, registerAgent, updateAvailability } from '$lib/contracts/hooks';
	import type { Job, Agent } from '$lib/types';
	import { JobStatus } from '$lib/types';
	import { formatEth } from '$lib/utils/format';
	import JobCard from '$lib/components/JobCard.svelte';
	import TierBadge from '$lib/components/TierBadge.svelte';

	let activeTab = $state<'buyer' | 'agent'>('buyer');
	let jobs = $state<Job[]>([]);
	let myAgent = $state<Agent | null>(null);
	let loading = $state(true);

	// Registration form
	let showRegForm = $state(false);
	let regIdentity = $state('');
	let regMetadataURI = $state('');
	let registering = $state(false);

	let buyerJobs = $derived(
		walletState.address
			? jobs.filter(j => j.buyer.toLowerCase() === walletState.address!.toLowerCase())
			: []
	);
	let agentJobs = $derived(
		walletState.address
			? jobs.filter(j => j.agent.toLowerCase() === walletState.address!.toLowerCase())
			: []
	);

	let totalEscrow = $derived(buyerJobs.reduce((sum, j) => sum + j.escrowAmount, 0n));
	let completedCount = $derived(buyerJobs.filter(j => j.status === JobStatus.Complete).length + agentJobs.filter(j => j.status === JobStatus.Complete).length);
	let activeCount = $derived(
		buyerJobs.filter(j => j.status === JobStatus.InProgress || j.status === JobStatus.Assigned).length +
		agentJobs.filter(j => j.status === JobStatus.InProgress || j.status === JobStatus.Assigned).length
	);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		jobs = await fetchJobs();
		if (walletState.address) {
			myAgent = await fetchAgent(walletState.address);
		}
		loading = false;
	}

	async function handleRegister() {
		if (!regIdentity) return;
		registering = true;
		const result = await registerAgent(regIdentity, regMetadataURI || 'ipfs://');
		if (result.success) {
			showRegForm = false;
			// Refresh agent profile
			if (walletState.address) {
				myAgent = await fetchAgent(walletState.address);
			}
		}
		registering = false;
	}

	async function toggleAvailability() {
		if (!myAgent) return;
		const result = await updateAvailability(!myAgent.isAvailable);
		if (result.success && walletState.address) {
			myAgent = await fetchAgent(walletState.address);
		}
	}
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
		<!-- Stats -->
		<div class="grid grid-cols-3 gap-4 mb-8">
			<div class="rounded-xl bg-surface p-5">
				<p class="text-sm text-text-muted">My Jobs</p>
				<p class="text-3xl font-bold text-primary">{buyerJobs.length + agentJobs.length}</p>
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

		<!-- Agent profile section -->
		<div class="mb-8 rounded-xl bg-surface p-5">
			<h2 class="text-lg font-semibold mb-3">Agent Profile</h2>
			{#if myAgent}
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<TierBadge tier={myAgent.tier} />
						<span class="text-sm">{myAgent.completedJobs} jobs completed</span>
						<span class="text-sm text-text-muted">·</span>
						<span class="text-sm">{myAgent.activeJobs} active</span>
					</div>
					<button onclick={toggleAvailability}
						class="rounded-lg px-4 py-2 text-sm font-semibold {myAgent.isAvailable ? 'bg-success/20 text-success' : 'bg-surface-light text-text-muted'} hover:opacity-80">
						{myAgent.isAvailable ? '● Available' : '○ Busy'}
					</button>
				</div>
			{:else if showRegForm}
				<div class="space-y-3">
					<div>
						<label class="block text-sm text-text-muted mb-1">ERC-8004 Identity (bytes32)</label>
						<input type="text" bind:value={regIdentity} placeholder="0x..."
							class="w-full rounded-lg bg-surface-dark border border-surface-light p-2 text-text text-sm focus:border-primary focus:outline-none" />
					</div>
					<div>
						<label class="block text-sm text-text-muted mb-1">Metadata URI (optional)</label>
						<input type="text" bind:value={regMetadataURI} placeholder="ipfs://..."
							class="w-full rounded-lg bg-surface-dark border border-surface-light p-2 text-text text-sm focus:border-primary focus:outline-none" />
					</div>
					<div class="flex gap-2">
						<button onclick={handleRegister} disabled={registering || !regIdentity}
							class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
							{registering ? 'Registering...' : 'Register'}
						</button>
						<button onclick={() => showRegForm = false}
							class="rounded-lg bg-surface-light px-4 py-2 text-sm text-text-muted hover:bg-surface-dark">
							Cancel
						</button>
					</div>
				</div>
			{:else}
				<p class="text-text-muted text-sm mb-3">Not registered as an agent.</p>
				<button onclick={() => showRegForm = true}
					class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
					Register as Agent
				</button>
			{/if}
		</div>

		<!-- Tabs -->
		<div class="mb-6 flex gap-2">
			<button onclick={() => activeTab = 'buyer'}
				class="rounded-lg px-4 py-2 text-sm font-semibold {activeTab === 'buyer' ? 'bg-primary text-white' : 'bg-surface text-text-muted hover:bg-surface-light'}">
				As Buyer ({buyerJobs.length})
			</button>
			<button onclick={() => activeTab = 'agent'}
				class="rounded-lg px-4 py-2 text-sm font-semibold {activeTab === 'agent' ? 'bg-primary text-white' : 'bg-surface text-text-muted hover:bg-surface-light'}">
				As Agent ({agentJobs.length})
			</button>
		</div>

		{#if activeTab === 'buyer'}
			<div>
				{#if buyerJobs.length > 0}
					<div class="mb-4 rounded-xl bg-surface-dark p-4">
						<p class="text-sm text-text-muted">Total escrowed: <span class="font-bold text-primary">{formatEth(totalEscrow)} ETH</span></p>
					</div>
				{/if}
				{#if buyerJobs.length === 0}
					<p class="text-text-muted">No jobs posted yet. <a href="{base}/jobs/new" class="text-primary hover:underline">Post your first job</a></p>
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
