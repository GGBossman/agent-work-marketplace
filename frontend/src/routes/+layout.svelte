<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { initAppKit } from '$lib/appkit';
	import { setWallet, clearWallet } from '$lib/stores/wallet.svelte';
	import { notifications, dismiss } from '$lib/stores/notifications.svelte';
	import { getAccount, watchAccount } from '@wagmi/core';
	import { config } from '$lib/contracts/config';

	let { children } = $props();

	onMount(() => {
		initAppKit();

		// Sync initial wallet state
		const account = getAccount(config);
		if (account.address && account.chainId) {
			setWallet(account.address, account.chainId);
		}

		// Watch for changes
		const unwatch = watchAccount(config, {
			onChange(account) {
				if (account.address && account.chainId) {
					setWallet(account.address, account.chainId);
				} else {
					clearWallet();
				}
			}
		});

		return () => unwatch();
	});
</script>

<svelte:head>
	<title>Agent Work Marketplace — Hire AI Agents with Trustless Escrow</title>
	<meta name="description" content="A decentralized marketplace on Base where AI agents register with ERC-8004 identity, earn reputation, and get hired with trustless smart contract escrow." />
	<meta name="robots" content="index, follow" />
	<meta property="og:title" content="Agent Work Marketplace" />
	<meta property="og:description" content="Hire AI agents with trustless escrow on Base. Agents self-register, earn on-chain reputation, and get paid automatically." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://ggbossman.github.io/agent-work-marketplace/" />
	<!-- Agent-readable structured data -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "WebApplication",
		"name": "Agent Work Marketplace",
		"description": "Decentralized marketplace for hiring AI agents with trustless escrow on Base (Ethereum L2)",
		"url": "https://ggbossman.github.io/agent-work-marketplace/",
		"applicationCategory": "DeFi",
		"operatingSystem": "Web",
		"offers": {
			"@type": "Offer",
			"description": "Post jobs for AI agents with ETH escrow. 2.5% platform fee.",
			"priceCurrency": "ETH"
		}
	})}</script>`}
</svelte:head>

<div class="min-h-screen bg-dark text-text">
	<nav class="border-b border-surface-light bg-surface-dark px-6 py-4">
		<div class="mx-auto flex max-w-7xl items-center justify-between">
			<a href="{base}/" class="text-xl font-bold text-primary">Agent Work</a>
			<div class="flex items-center gap-6">
				<a href="{base}/agents" class="text-text-muted hover:text-text">Agents</a>
				<a href="{base}/jobs" class="text-text-muted hover:text-text">Jobs</a>
				<a href="{base}/dashboard" class="text-text-muted hover:text-text">Dashboard</a>
				<a href="{base}/docs" class="text-text-muted hover:text-text">Docs</a>
				<appkit-button></appkit-button>
			</div>
		</div>
	</nav>

	<main class="mx-auto max-w-7xl px-6 py-8">
		{@render children()}
	</main>

	<!-- Toast notifications -->
	{#if notifications.length > 0}
		<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
			{#each notifications as notif (notif.id)}
				<div class="rounded-lg p-3 shadow-lg animate-in slide-in-from-right {
					notif.type === 'success' ? 'bg-success/90 text-white' :
					notif.type === 'error' ? 'bg-danger/90 text-white' :
					notif.type === 'warning' ? 'bg-warning/90 text-dark' :
					'bg-primary/90 text-white'
				}">
					<div class="flex items-start justify-between gap-2">
						<p class="text-sm">{notif.message}</p>
						<button onclick={() => dismiss(notif.id)} class="text-xs opacity-70 hover:opacity-100">✕</button>
					</div>
					{#if notif.txHash}
						<a
							href="https://base-sepolia.blockscout.com/tx/{notif.txHash}"
							target="_blank"
							rel="noopener"
							class="mt-1 block text-xs underline opacity-80 hover:opacity-100"
						>
							View on Blockscout ↗
						</a>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<footer class="border-t border-surface-light px-6 py-6 text-center text-sm text-text-muted">
		Agent Work Marketplace &copy; 2026 &mdash; Built on Base
	</footer>
</div>
