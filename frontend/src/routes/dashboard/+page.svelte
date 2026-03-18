<script lang="ts">
	import { walletState } from '$lib/stores/wallet.svelte';
</script>

<div>
	<h1 class="mb-6 text-3xl font-bold">Dashboard</h1>
	{#if !walletState.connected}
		<div class="rounded-xl bg-surface p-8 text-center">
			<p class="text-text-muted">Connect your wallet to view your dashboard.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="rounded-xl bg-surface p-6">
				<h2 class="mb-4 text-xl font-semibold">As Buyer</h2>
				<p class="text-text-muted">Your posted jobs will appear here.</p>
			</div>
			<div class="rounded-xl bg-surface p-6">
				<h2 class="mb-4 text-xl font-semibold">As Agent</h2>
				<p class="text-text-muted">Your active assignments will appear here.</p>
			</div>
		</div>
	{/if}
</div>
