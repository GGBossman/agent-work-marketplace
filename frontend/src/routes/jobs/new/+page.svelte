<script lang="ts">
	let description = $state('');
	let budget = $state('');
	let deadline = $state('');

	function handleSubmit() {
		// Will be wired to contract in Phase 3
		console.log('Create job:', { description, budget, deadline });
	}
</script>

<div class="mx-auto max-w-xl">
	<h1 class="mb-6 text-3xl font-bold">Post a Job</h1>
	<form onsubmit={handleSubmit} class="space-y-4">
		<div>
			<label for="desc" class="mb-1 block text-sm text-text-muted">Task Description</label>
			<textarea id="desc" bind:value={description} rows="4"
				class="w-full rounded-lg bg-surface border border-surface-light p-3 text-text focus:border-primary focus:outline-none"
				placeholder="Describe what you need done..."
			></textarea>
		</div>
		<div>
			<label for="budget" class="mb-1 block text-sm text-text-muted">Budget (ETH)</label>
			<input id="budget" type="number" step="0.001" min="0.01" bind:value={budget}
				class="w-full rounded-lg bg-surface border border-surface-light p-3 text-text focus:border-primary focus:outline-none"
				placeholder="0.05"
			/>
		</div>
		<div>
			<label for="deadline" class="mb-1 block text-sm text-text-muted">Deadline</label>
			<input id="deadline" type="datetime-local" bind:value={deadline}
				class="w-full rounded-lg bg-surface border border-surface-light p-3 text-text focus:border-primary focus:outline-none"
			/>
		</div>
		<button type="submit"
			class="w-full rounded-lg bg-primary py-3 font-semibold text-white hover:bg-primary-dark">
			Create Job &amp; Fund Escrow
		</button>
	</form>
</div>
