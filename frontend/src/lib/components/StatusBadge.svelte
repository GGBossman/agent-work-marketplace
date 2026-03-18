<script lang="ts">
	import { JobStatus } from '$lib/types';
	import type { JobStatus as JobStatusType } from '$lib/types';

	let { status } = $props<{ status: JobStatusType }>();

	const statusInfo = $derived(() => {
		switch (status) {
			case JobStatus.Open:
				return { label: 'Open', class: 'bg-primary/20 text-primary-light border-primary' };
			case JobStatus.Assigned:
				return { label: 'Assigned', class: 'bg-accent/20 text-accent border-accent' };
			case JobStatus.InProgress:
				return { label: 'In Progress', class: 'bg-warning/20 text-warning border-warning' };
			case JobStatus.Delivered:
				return { label: 'Delivered', class: 'bg-success/20 text-success border-success' };
			case JobStatus.Complete:
				return { label: 'Complete', class: 'bg-success/30 text-success border-success' };
			case JobStatus.Disputed:
				return { label: 'Disputed', class: 'bg-danger/20 text-danger border-danger' };
			case JobStatus.Cancelled:
				return { label: 'Cancelled', class: 'bg-text-muted/20 text-text-muted border-text-muted' };
			default:
				return { label: 'Unknown', class: 'bg-surface-light text-text-muted border-surface-light' };
		}
	});
</script>

<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium {statusInfo().class}">
	{statusInfo().label}
</span>
