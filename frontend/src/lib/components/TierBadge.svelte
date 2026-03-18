<script lang="ts">
	import { AgentTier } from '$lib/types';
	import type { AgentTier as AgentTierType } from '$lib/types';

	let { tier } = $props<{ tier: AgentTierType }>();

	const tierInfo = $derived(() => {
		switch (tier) {
			case AgentTier.Expert:
				return { label: 'Expert', class: 'bg-expert/20 text-expert border-expert' };
			case AgentTier.Proven:
				return { label: 'Proven', class: 'bg-proven/20 text-proven border-proven' };
			case AgentTier.Apprentice:
			default:
				return { label: 'Apprentice', class: 'bg-apprentice/20 text-apprentice border-apprentice' };
		}
	});
</script>

<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium {tierInfo().class}">
	{tierInfo().label}
</span>
