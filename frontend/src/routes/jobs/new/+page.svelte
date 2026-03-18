<script lang="ts">
	import { createJob } from '$lib/contracts/hooks';
	import { walletState } from '$lib/stores/wallet.svelte';
	import { parseEther } from 'viem';
	import { goto } from '$app/navigation';

	let description = $state('');
	let budget = $state('');
	let deadline = $state('');
	let submitting = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!walletState.connected) {
			error = 'Please connect your wallet first';
			return;
		}

		if (!description || description.length < 10) {
			error = 'Task description must be at least 10 characters';
			return;
		}

		if (!budget || parseFloat(budget) <= 0) {
			error = 'Budget must be greater than 0';
			return;
		}

		if (!deadline) {
			error = 'Deadline is required';
			return;
		}

		const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
		if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
			error = 'Deadline must be in the future';
			return;
		}

		submitting = true;
		try {
			const value = parseEther(budget);
			const result = await createJob(description, deadlineTimestamp, value);
			if (result.success && result.jobId) {
				goto(`/jobs/${result.jobId}`);
			} else if (result.success) {
				goto('/jobs');
			}
		} catch (err: any) {
			error = err?.message ?? 'Failed to create job';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="mx-auto max-w-xl">
	<h1 class="mb-6 text-3xl font-bold">Post a Job</h1>

	{#if !walletState.connected}
		<div class="rounded-xl bg-surface p-8 text-center">
			<p class="text-lg text-text-muted mb-4">Connect your wallet to post a job.</p>
			<appkit-button></appkit-button>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="space-y-4">
			{#if error}
				<div class="rounded-lg bg-danger/10 border border-danger/30 p-3 text-sm text-danger">
					{error}
				</div>
			{/if}

			<div>
				<label for="desc" class="mb-1 block text-sm text-text-muted">Task Description</label>
				<textarea id="desc" bind:value={description} rows="4"
					class="w-full rounded-lg bg-surface border border-surface-light p-3 text-text focus:border-primary focus:outline-none"
					placeholder="Describe what you need done..."
				></textarea>
			</div>
			<div>
				<label for="budget" class="mb-1 block text-sm text-text-muted">Budget (ETH)</label>
				<input id="budget" type="number" step="0.001" min="0.001" bind:value={budget}
					class="w-full rounded-lg bg-surface border border-surface-light p-3 text-text focus:border-primary focus:outline-none"
					placeholder="0.05"
				/>
				<p class="mt-1 text-xs text-text-muted">This amount will be locked in escrow. 2.5% platform fee on completion.</p>
			</div>
			<div>
				<label for="deadline" class="mb-1 block text-sm text-text-muted">Deadline</label>
				<input id="deadline" type="datetime-local" bind:value={deadline}
					class="w-full rounded-lg bg-surface border border-surface-light p-3 text-text focus:border-primary focus:outline-none"
				/>
			</div>
			<button type="submit" disabled={submitting}
				class="w-full rounded-lg bg-primary py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
				{submitting ? 'Creating Job...' : 'Create Job & Fund Escrow'}
			</button>
		</form>
	{/if}
</div>
