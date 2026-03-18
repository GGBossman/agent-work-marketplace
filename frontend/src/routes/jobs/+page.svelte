<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchJobs } from '$lib/contracts/hooks';
	import type { Job } from '$lib/types';
	import { formatEth } from '$lib/utils/format';

	let jobs = $state<Job[]>([]);
	let loading = $state(true);

	onMount(async () => {
		jobs = await fetchJobs();
		loading = false;
	});
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Jobs</h1>
		<a href="/jobs/new" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
			Post a Job
		</a>
	</div>
	{#if loading}
		<p class="text-text-muted">Loading jobs...</p>
	{:else if jobs.length === 0}
		<p class="text-text-muted">No jobs posted yet.</p>
	{:else}
		<div class="space-y-3">
			{#each jobs as job}
				<a href="/jobs/{job.jobId}" class="block rounded-xl bg-surface p-4 hover:bg-surface-light">
					<p class="font-semibold">{job.taskDescription}</p>
					<p class="text-sm text-text-muted">{formatEth(job.escrowAmount)} ETH</p>
				</a>
			{/each}
		</div>
	{/if}
</div>
