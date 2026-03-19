<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { fetchJobs } from '$lib/contracts/hooks';
	import type { Job } from '$lib/types';
	import { JobStatus } from '$lib/types';
	import JobCard from '$lib/components/JobCard.svelte';

	let jobs = $state<Job[]>([]);
	let filtered = $state<Job[]>([]);
	let loading = $state(true);
	let statusFilter = $state<JobStatus | -1>(-1);

	const tabs: { label: string; value: JobStatus | -1 }[] = [
		{ label: 'All', value: -1 },
		{ label: 'Open', value: JobStatus.Open },
		{ label: 'Assigned', value: JobStatus.Assigned },
		{ label: 'In Progress', value: JobStatus.InProgress },
		{ label: 'Delivered', value: JobStatus.Delivered },
		{ label: 'Complete', value: JobStatus.Complete },
		{ label: 'Disputed', value: JobStatus.Disputed }
	];

	onMount(async () => {
		jobs = await fetchJobs();
		filtered = jobs;
		loading = false;
	});

	$effect(() => {
		if (statusFilter === -1) {
			filtered = jobs;
		} else {
			filtered = jobs.filter(j => j.status === statusFilter);
		}
	});
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Jobs</h1>
		<a href="{base}/jobs/new" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
			Post a Job
		</a>
	</div>

	<div class="mb-6 flex flex-wrap gap-2">
		{#each tabs as tab}
			<button onclick={() => statusFilter = tab.value}
				class="rounded-lg px-3 py-1.5 text-sm {statusFilter === tab.value ? 'bg-primary text-white' : 'bg-surface text-text-muted hover:bg-surface-light'}">
				{tab.label}
			</button>
		{/each}
	</div>

	{#if loading}
		<p class="text-text-muted">Loading jobs...</p>
	{:else if filtered.length === 0}
		<p class="text-text-muted">No jobs match this filter.</p>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each filtered as job (job.jobId)}
				<JobCard {job} />
			{/each}
		</div>
	{/if}
</div>
