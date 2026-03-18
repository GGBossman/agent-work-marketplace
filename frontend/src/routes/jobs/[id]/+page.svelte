<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fetchJob, confirmDelivery, cancelJob, submitDeliverable, acceptJob, fileDispute } from '$lib/contracts/hooks';
	import type { Job } from '$lib/types';
	import { JobStatus } from '$lib/types';
	import { formatEth, truncateAddress, formatDate, timeAgo } from '$lib/utils/format';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let job = $state<Job | null>(null);
	let loading = $state(true);
	let acting = $state(false);
	let deliverableInput = $state('');

	onMount(async () => {
		job = await fetchJob($page.params.id);
		loading = false;
	});

	async function handleConfirm() {
		if (!job) return;
		acting = true;
		await confirmDelivery(job.jobId);
		job = await fetchJob(job.jobId);
		acting = false;
	}

	async function handleCancel() {
		if (!job) return;
		acting = true;
		await cancelJob(job.jobId);
		job = await fetchJob(job.jobId);
		acting = false;
	}

	async function handleSubmitDeliverable() {
		if (!job || !deliverableInput) return;
		acting = true;
		await submitDeliverable(job.jobId, deliverableInput);
		job = await fetchJob(job.jobId);
		acting = false;
	}

	async function handleAccept() {
		if (!job) return;
		acting = true;
		await acceptJob(job.jobId);
		job = await fetchJob(job.jobId);
		acting = false;
	}

	async function handleDispute() {
		if (!job) return;
		acting = true;
		await fileDispute(job.jobId);
		job = await fetchJob(job.jobId);
		acting = false;
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
			<p class="mt-2 text-sm text-text-muted">Job #{job.jobId} · Created {timeAgo(job.createdAt)}</p>
		</div>

		<div class="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Escrow</p>
				<p class="text-xl font-bold text-primary">{formatEth(job.escrowAmount)} ETH</p>
			</div>
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Buyer</p>
				<p class="text-sm font-mono">{truncateAddress(job.buyer)}</p>
			</div>
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Agent</p>
				<p class="text-sm font-mono">
					{job.agent === '0x0000000000000000000000000000000000000000' ? 'Unassigned' : truncateAddress(job.agent)}
				</p>
			</div>
			<div class="rounded-xl bg-surface p-4">
				<p class="text-sm text-text-muted">Deadline</p>
				<p class="text-sm">{formatDate(job.deadline)}</p>
			</div>
		</div>

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
			{#if job.status === JobStatus.Assigned}
				<button onclick={handleAccept} disabled={acting}
					class="rounded-lg bg-success px-6 py-2.5 font-semibold text-white hover:bg-success/80 disabled:opacity-50">
					{acting ? 'Accepting...' : 'Accept Job (Stake 10%)'}
				</button>
			{/if}

			{#if job.status === JobStatus.InProgress}
				<div class="flex w-full gap-3">
					<input type="text" bind:value={deliverableInput} placeholder="ipfs://..."
						class="flex-1 rounded-lg bg-surface border border-surface-light px-4 py-2.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none" />
					<button onclick={handleSubmitDeliverable} disabled={acting || !deliverableInput}
						class="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
						{acting ? 'Submitting...' : 'Submit Deliverable'}
					</button>
				</div>
			{/if}

			{#if job.status === JobStatus.Delivered}
				<button onclick={handleConfirm} disabled={acting}
					class="rounded-lg bg-success px-6 py-2.5 font-semibold text-white hover:bg-success/80 disabled:opacity-50">
					{acting ? 'Confirming...' : 'Confirm Delivery'}
				</button>
				<button onclick={handleDispute} disabled={acting}
					class="rounded-lg bg-danger px-6 py-2.5 font-semibold text-white hover:bg-danger/80 disabled:opacity-50">
					{acting ? 'Filing...' : 'File Dispute (0.01 ETH)'}
				</button>
				<div class="w-full mt-2 rounded-lg bg-surface-dark p-3 text-sm text-text-muted">
					Auto-release in 72h if buyer doesn't respond
				</div>
			{/if}

			{#if job.status === JobStatus.Open || job.status === JobStatus.Assigned}
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
		</div>
	{/if}
</div>
