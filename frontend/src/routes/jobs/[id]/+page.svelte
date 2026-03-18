<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fetchJob } from '$lib/contracts/hooks';
	import type { Job } from '$lib/types';
	import { formatEth, truncateAddress } from '$lib/utils/format';

	let job = $state<Job | null>(null);
	let loading = $state(true);

	onMount(async () => {
		const id = $page.params.id;
		job = await fetchJob(id);
		loading = false;
	});
</script>

<div>
	{#if loading}
		<p class="text-text-muted">Loading job...</p>
	{:else if !job}
		<p class="text-text-muted">Job not found.</p>
	{:else}
		<h1 class="mb-2 text-3xl font-bold">{job.taskDescription || 'Job Detail'}</h1>
		<p class="text-text-muted">Buyer: {truncateAddress(job.buyer)}</p>
		<p class="mt-2 text-lg font-semibold text-primary">{formatEth(job.escrowAmount)} ETH</p>
	{/if}
</div>
