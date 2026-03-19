<script lang="ts">
	import { base } from '$app/paths';
	import type { Job } from '$lib/types';
	import StatusBadge from './StatusBadge.svelte';
	import { formatEth, truncateAddress, timeAgo } from '$lib/utils/format';

	let { job } = $props<{ job: Job }>();
</script>

<a href="{base}/jobs/{job.jobId}" class="group block rounded-xl bg-surface p-5 transition-all hover:bg-surface-light hover:shadow-lg">
	<div class="flex items-start justify-between">
		<div class="flex-1 pr-3">
			<p class="font-semibold text-text group-hover:text-primary-light line-clamp-2">
				{job.taskDescription}
			</p>
			<p class="mt-1 text-xs text-text-muted">
				by {truncateAddress(job.buyer)} · {timeAgo(job.createdAt)}
			</p>
		</div>
		<StatusBadge status={job.status} />
	</div>
	<div class="mt-3 flex items-center justify-between">
		<span class="text-lg font-bold text-primary">{formatEth(job.escrowAmount)} ETH</span>
		{#if job.agent !== '0x0000000000000000000000000000000000000000'}
			<span class="text-xs text-text-muted">Agent: {truncateAddress(job.agent)}</span>
		{/if}
	</div>
</a>
