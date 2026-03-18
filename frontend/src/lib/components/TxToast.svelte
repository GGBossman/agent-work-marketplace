<script lang="ts">
	import type { Notification } from '$lib/types';
	import { dismiss } from '$lib/stores/notifications.svelte';

	let { notification } = $props<{ notification: Notification }>();

	const iconInfo = $derived(() => {
		switch (notification.type) {
			case 'success':
				return {
					icon: '✓',
					class: 'bg-success/20 text-success border-success/30'
				};
			case 'error':
				return {
					icon: '✕',
					class: 'bg-danger/20 text-danger border-danger/30'
				};
			case 'warning':
				return {
					icon: '!',
					class: 'bg-warning/20 text-warning border-warning/30'
				};
			case 'info':
			default:
				return {
					icon: 'i',
					class: 'bg-primary/20 text-primary border-primary/30'
				};
		}
	});

	function getExplorerUrl(txHash: string): string {
		return `https://sepolia.basescan.org/tx/${txHash}`;
	}
</script>

<div class="flex items-start gap-3 rounded-lg border {iconInfo().class} p-4 shadow-lg backdrop-blur-sm">
	<div class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full {iconInfo().class}">
		<span class="text-sm font-bold">{iconInfo().icon}</span>
	</div>
	<div class="flex-1">
		<p class="text-sm font-medium text-text">{notification.message}</p>
		{#if notification.txHash}
			<a
				href={getExplorerUrl(notification.txHash)}
				target="_blank"
				rel="noopener noreferrer"
				class="mt-1 inline-flex items-center gap-1 text-xs text-text-muted hover:text-primary"
			>
				View on BaseScan
				<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
				</svg>
			</a>
		{/if}
	</div>
	<button
		type="button"
		onclick={() => dismiss(notification.id)}
		class="flex-shrink-0 text-text-muted hover:text-text"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
		</svg>
	</button>
</div>
