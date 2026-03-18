<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fetchJob, fetchAgents, confirmDelivery, cancelJob, submitDeliverable, acceptJob, fileDispute, assignAgent } from '$lib/contracts/hooks';
	import type { Job, Agent } from '$lib/types';
	import { JobStatus } from '$lib/types';
	import { formatEth, truncateAddress, formatDate, timeAgo } from '$lib/utils/format';
	import { walletState } from '$lib/stores/wallet.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let job = $state<Job | null>(null);
	let agents = $state<Agent[]>([]);
	let loading = $state(true);
	let acting = $state(false);
	let deliverableInput = $state('');
	let selectedAgent = $state('');
	let showAssignForm = $state(false);

	const isBuyer = $derived(
		job && walletState.address
			? job.buyer.toLowerCase() === walletState.address.toLowerCase()
			: false
	);
	const isAgent = $derived(
		job && walletState.address
			? job.agent.toLowerCase() === walletState.address.toLowerCase()
			: false
	);

	onMount(async () => {
		const jobId = $page.params.id;
		job = await fetchJob(jobId);
		loading = false;
	});

	async function handleConfirm() {
		if (!job) return;
		acting = true;
		const result = await confirmDelivery(job.jobId);
		if (result.success) job = await fetchJob(job.jobId);
		acting = false;
	}

	async function handleCancel() {
		if (!job) return;
		acting = true;
		const result = await cancelJob(job.jobId);
		if (result.success) job = await fetchJob(job.jobId);
		acting = false;
	}

	async function handleSubmitDeliverable() {
		if (!job || !deliverableInput) return;
		acting = true;
		const result = await submitDeliverable(job.jobId, deliverableInput);
		if (result.success) job = await fetchJob(job.jobId);
		acting = false;
	}

	async function handleAccept() {
		if (!job) return;
		acting = true;
		const result = await acceptJob(job.jobId);
		if (result.success) job = await fetchJob(job.jobId);
		acting = false;
	}

	async function handleDispute() {
		if (!job) return;
		acting = true;
		const result = await fileDispute(job.jobId);
		if (result.success) job = await fetchJob(job.jobId);
		acting = false;
	}

	async function handleAssign() {
		if (!job || !selectedAgent) return;
		acting = true;
		const result = await assignAgent(job.jobId, selectedAgent);
		if (result.success) job = await fetchJob(job.jobId);
		showAssignForm = false;
		acting = false;
	}

	async function openAssignForm() {
		showAssignForm = true;
		agents = await fetchAgents();
	}
</script>

<div>
	{#if loading}
		<p class="text-text-muted">Loading job...</p>
	{:else if !job}
		<div class="text-center py-12">
			<p class="text-text-muted text-lg">Job not found.</p>
			<a href="/jobs" class="mt-4 inline-block text-primary hover:text-primary-light">← Back to jobs</a>
		</div>
	{:else}
		<div class="mb-6">
			<div class="flex items-start justify-between gap-4">
				<h1 class="text-2xl font-bold">{job.taskDescription}</h1>
				<StatusBadge status={job.status} />
			</div>
			<p class="mt-2 text-sm text-text-muted">Job {truncateAddress(job.jobId)} · Created {timeAgo(job.createdAt)}</p>
		</div>

		<div class="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Escrow</p>
				<p class="text-xl font-bold text-primary">{formatEth(job.escrowAmount)} ETH</p>
			</div>
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Buyer</p>
				<p class="text-sm font-mono">{truncateAddress(job.buyer)}</p>
				{#if isBuyer}<span class="text-xs text-primary">(you)</span>{/if}
			</div>
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Agent</p>
				<p class="text-sm font-mono">
					{job.agent === '0x0000000000000000000000000000000000000000' ? 'Unassigned' : truncateAddress(job.agent)}
				</p>
				{#if isAgent}<span class="text-xs text-primary">(you)</span>{/if}
			</div>
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Deadline</p>
				<p class="text-sm">{formatDate(job.deadline)}</p>
			</div>
		</div>

		{#if job.stakeAmount > 0n}
			<div class="mb-4 rounded-lg bg-surface-dark p-3 text-sm text-text-muted">
				Agent stake: {formatEth(job.stakeAmount)} ETH (10% of escrow)
			</div>
		{/if}

		{#if job.deliverableURI}
			<div class="mb-6 rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Deliverable</p>
				<p class="text-sm font-mono text-accent break-all">{job.deliverableURI}</p>
				{#if job.deliveredAt > 0}
					<p class="mt-1 text-xs text-text-muted">Delivered {timeAgo(job.deliveredAt)}</p>
				{/if}
			</div>
		{/if}

		<div class="flex flex-wrap gap-3">
			<!-- Buyer: Assign agent to open job -->
			{#if job.status === JobStatus.Open && isBuyer}
				{#if showAssignForm}
					<div class="w-full space-y-3 rounded-xl bg-surface p-4">
						<p class="text-sm font-semibold">Select an agent to assign:</p>
						{#if agents.length === 0}
							<p class="text-sm text-text-muted">No registered agents found. Enter an address manually:</p>
						{/if}
						<div class="flex gap-2">
							<input type="text" bind:value={selectedAgent} placeholder="0x... agent address"
								class="flex-1 rounded-lg bg-surface-dark border border-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
							<button onclick={handleAssign} disabled={acting || !selectedAgent}
								class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
								{acting ? 'Assigning...' : 'Assign'}
							</button>
						</div>
						{#if agents.length > 0}
							<div class="space-y-1">
								{#each agents.filter(a => a.isAvailable) as agent}
									<button onclick={() => selectedAgent = agent.address}
										class="w-full text-left rounded-lg p-2 text-sm hover:bg-surface-light {selectedAgent === agent.address ? 'bg-primary/10 border border-primary/30' : ''}">
										<span class="font-mono">{truncateAddress(agent.address)}</span>
										<span class="text-text-muted"> · {agent.completedJobs} jobs · Tier {agent.tier}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{:else}
					<button onclick={openAssignForm}
						class="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-dark">
						Assign Agent
					</button>
				{/if}
			{/if}

			<!-- Agent: Accept assigned job -->
			{#if job.status === JobStatus.Assigned && isAgent}
				<button onclick={handleAccept} disabled={acting}
					class="rounded-lg bg-success px-6 py-2.5 font-semibold text-white hover:bg-success/80 disabled:opacity-50">
					{acting ? 'Accepting...' : `Accept Job (Stake ${formatEth((job.escrowAmount * 1000n) / 10000n)} ETH)`}
				</button>
			{/if}

			<!-- Agent: Submit deliverable -->
			{#if job.status === JobStatus.InProgress && isAgent}
				<div class="flex w-full gap-3">
					<input type="text" bind:value={deliverableInput} placeholder="ipfs://..."
						class="flex-1 rounded-lg bg-surface border border-surface-light px-4 py-2.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none" />
					<button onclick={handleSubmitDeliverable} disabled={acting || !deliverableInput}
						class="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
						{acting ? 'Submitting...' : 'Submit Deliverable'}
					</button>
				</div>
			{/if}

			<!-- Buyer: Confirm or dispute delivered job -->
			{#if job.status === JobStatus.Delivered && isBuyer}
				<button onclick={handleConfirm} disabled={acting}
					class="rounded-lg bg-success px-6 py-2.5 font-semibold text-white hover:bg-success/80 disabled:opacity-50">
					{acting ? 'Confirming...' : 'Confirm Delivery & Release Payment'}
				</button>
				<button onclick={handleDispute} disabled={acting}
					class="rounded-lg bg-danger px-6 py-2.5 font-semibold text-white hover:bg-danger/80 disabled:opacity-50">
					{acting ? 'Filing...' : 'File Dispute (0.01 ETH)'}
				</button>
			{/if}

			<!-- Auto-release info on delivered -->
			{#if job.status === JobStatus.Delivered}
				<div class="w-full mt-2 rounded-lg bg-surface-dark p-3 text-sm text-text-muted">
					Auto-release: 70% to agent at 72h, full release at 96h if buyer doesn't respond
				</div>
			{/if}

			<!-- Buyer: Cancel open/assigned job -->
			{#if (job.status === JobStatus.Open || job.status === JobStatus.Assigned) && isBuyer}
				<button onclick={handleCancel} disabled={acting}
					class="rounded-lg border border-danger px-6 py-2.5 font-semibold text-danger hover:bg-danger/10 disabled:opacity-50">
					{acting ? 'Cancelling...' : 'Cancel Job'}
				</button>
			{/if}

			{#if job.status === JobStatus.Complete}
				<div class="w-full rounded-lg bg-success/10 border border-success/30 p-4 text-center text-success">
					✓ Job completed — payment released
				</div>
			{/if}

			{#if job.status === JobStatus.Disputed}
				<div class="w-full rounded-lg bg-danger/10 border border-danger/30 p-4 text-center text-danger">
					⚠ Under dispute — awaiting resolution
				</div>
			{/if}

			{#if job.status === JobStatus.Cancelled}
				<div class="w-full rounded-lg bg-surface-dark border border-surface-light p-4 text-center text-text-muted">
					Job cancelled — escrow refunded to buyer
				</div>
			{/if}
		</div>
	{/if}
</div>
