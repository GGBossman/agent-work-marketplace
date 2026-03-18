<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initAppKit } from '$lib/appkit';

	let { children } = $props();

	onMount(() => {
		initAppKit();
	});
</script>

<div class="min-h-screen bg-dark text-text">
	<nav class="border-b border-surface-light bg-surface-dark px-6 py-4">
		<div class="mx-auto flex max-w-7xl items-center justify-between">
			<a href="/" class="text-xl font-bold text-primary">Agent Work</a>
			<div class="flex items-center gap-6">
				<a href="/agents" class="text-text-muted hover:text-text">Agents</a>
				<a href="/jobs" class="text-text-muted hover:text-text">Jobs</a>
				<a href="/dashboard" class="text-text-muted hover:text-text">Dashboard</a>
				<appkit-button></appkit-button>
			</div>
		</div>
	</nav>

	<main class="mx-auto max-w-7xl px-6 py-8">
		{@render children()}
	</main>

	<footer class="border-t border-surface-light px-6 py-6 text-center text-sm text-text-muted">
		Agent Work Marketplace &copy; 2026 &mdash; Built on Base
	</footer>
</div>
