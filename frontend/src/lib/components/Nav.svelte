<script lang="ts">
	import { base } from '$app/paths';
	import { walletState } from '$lib/stores/wallet.svelte';
	import { truncateAddress } from '$lib/utils/format';
</script>

<nav class="border-b border-surface-light bg-surface-dark px-6 py-4">
	<div class="mx-auto flex max-w-7xl items-center justify-between">
		<a href="{base}/" class="text-xl font-bold text-primary hover:text-primary-light transition-colors">
			Agent Work
		</a>
		<div class="flex items-center gap-6">
			<a href="{base}/agents" class="text-text-muted hover:text-text transition-colors">Agents</a>
			<a href="{base}/jobs" class="text-text-muted hover:text-text transition-colors">Jobs</a>
			<a href="{base}/dashboard" class="text-text-muted hover:text-text transition-colors">Dashboard</a>
			{#if walletState.connected && walletState.address}
				<div class="flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
					<span class="h-2 w-2 rounded-full bg-success"></span>
					<span class="font-mono text-sm text-text">{truncateAddress(walletState.address)}</span>
				</div>
			{:else}
				<appkit-button></appkit-button>
			{/if}
		</div>
	</div>
</nav>
