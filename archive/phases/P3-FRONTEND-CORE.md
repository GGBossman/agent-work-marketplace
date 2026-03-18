# Phase 3: Frontend Core Scaffold
## Agent Work Marketplace

**Phase:** P3-FRONTEND-CORE  
**Est. Tokens:** ~35K  
**Depends On:** P0 (Project Scaffold — SvelteKit + Reown AppKit + TailwindCSS v4 installed)  
**Produces:** Wallet connection, layout, shared components, route page skeletons. NO contract interaction.  
**Next Phase:** P4 (Frontend Dashboard)

---

## CRITICAL: Technology Constraints

1. **Svelte 5 runes** — Use `$state`, `$derived`, `$props()`, `$effect`. Do NOT use legacy `writable()` stores for new component state.
2. **TailwindCSS v4** — Config is in CSS (`@theme` block in `app.css`). No `tailwind.config.js` exists.
3. **Reown AppKit** — Wallet connection uses `<appkit-button />` web component and `@reown/appkit`. Do NOT import `wagmi` React hooks directly.
4. **SvelteKit SPA** — Using `adapter-static` with `fallback: 'index.html'`. Do NOT create `+page.server.ts` files. All data loading must be client-side.
5. **Component props** — Use `let { prop } = $props()` NOT `export let prop`.

---

## Pre-Execution Checklist

1. Read `projects/synthesis/MANIFEST.md`
2. Verify P0 scaffold exists: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/src/app.css`
3. Verify `frontend/src/lib/appkit.ts` exists (Reown AppKit config from P0)
4. Verify `frontend/src/lib/types.ts` exists (shared types from P0)

---

## Build Prompt

```
You are building Phase 3 of the Agent Work Marketplace — the frontend core scaffold.

IMPORTANT TECHNOLOGY RULES:
- Svelte 5: Use $state, $derived, $props(), $effect — NOT writable() stores
- TailwindCSS v4: CSS-based config. Custom colors defined in app.css @theme block. Use classes like bg-apprentice, bg-proven, bg-expert.
- Reown AppKit: Use <appkit-button /> web component for wallet connect. Import appKit from $lib/appkit for programmatic access.
- SPA mode: No +page.server.ts files. Use onMount() or $effect for data loading.
- Props: let { myProp } = $props() NOT export let myProp

## Step 1: Wallet State Module (src/lib/stores/wallet.svelte.ts)

Create a reactive wallet state using Svelte 5 runes in a .svelte.ts file:

```typescript
// src/lib/stores/wallet.svelte.ts
import { browser } from '$app/environment';

// Reactive wallet state using Svelte 5 runes
let address = $state<string | null>(null);
let isConnected = $state(false);
let chainId = $state<number | null>(null);

export function getWalletState() {
  return {
    get address() { return address; },
    get isConnected() { return isConnected; },
    get chainId() { return chainId; },
  };
}

export function setWalletState(addr: string | null, connected: boolean, chain: number | null) {
  address = addr;
  isConnected = connected;
  chainId = chain;
}

// Listen to AppKit state changes
export function initWalletListener() {
  if (!browser) return;

  // AppKit exposes state via its modal instance
  // The <appkit-button /> handles connection UI automatically
  // For programmatic access, use appKit from $lib/appkit
}
```

**Note:** The `<appkit-button />` web component from Reown handles the full wallet connection UI (modal, chain switching, account display). We mainly need this state module for reading the connected address in other components.

## Step 2: Layout (src/routes/+layout.svelte)

Update the existing layout from P0:

```svelte
<script>
  let { children } = $props();
  import "../app.css";
  import '$lib/appkit'; // Initialize AppKit
</script>

<div class="min-h-screen bg-dark text-white">
  <!-- Navigation -->
  <nav class="border-b border-white/10 px-6 py-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <a href="/" class="text-xl font-bold text-primary">Agent Work Marketplace</a>
      
      <div class="hidden md:flex items-center gap-6">
        <a href="/agents" class="text-muted hover:text-white transition">Agents</a>
        <a href="/jobs" class="text-muted hover:text-white transition">Jobs</a>
        <a href="/dashboard" class="text-muted hover:text-white transition">Dashboard</a>
      </div>

      <!-- Reown AppKit wallet button (web component) -->
      <appkit-button />
    </div>
  </nav>

  <!-- Page content -->
  <main class="max-w-7xl mx-auto px-6 py-8">
    {@render children()}
  </main>

  <!-- Footer -->
  <footer class="border-t border-white/10 px-6 py-4 text-center text-muted text-sm">
    Built for The Synthesis Hackathon 2026 · Base Mainnet
  </footer>
</div>
```

## Step 3: Shared Components (src/lib/components/)

**TierBadge.svelte**
```svelte
<script lang="ts">
  import type { AgentTier } from '$lib/types';
  let { tier }: { tier: AgentTier } = $props();

  const styles: Record<AgentTier, string> = {
    Apprentice: 'bg-apprentice text-white',
    Proven: 'bg-proven text-white',
    Expert: 'bg-expert text-black',
  };
</script>

<span class="px-2 py-1 rounded-full text-xs font-semibold {styles[tier]}">
  {tier}
</span>
```

**StatusBadge.svelte**
```svelte
<script lang="ts">
  import type { JobStatus } from '$lib/types';
  let { status }: { status: JobStatus } = $props();

  const styles: Record<JobStatus, string> = {
    Open: 'bg-green-600',
    Assigned: 'bg-blue-400',
    InProgress: 'bg-blue-600',
    Delivered: 'bg-purple-600',
    Disputed: 'bg-red-600',
    Complete: 'bg-gray-600',
    Cancelled: 'bg-gray-800',
  };
</script>

<span class="px-2 py-1 rounded-full text-xs font-semibold text-white {styles[status]}">
  {status}
</span>
```

**AgentCard.svelte**
```svelte
<script lang="ts">
  import type { Agent } from '$lib/types';
  import TierBadge from './TierBadge.svelte';

  let { agent }: { agent: Agent } = $props();
</script>

<a href="/agents/{agent.address}" 
   class="block bg-surface rounded-xl p-6 border border-white/10 hover:border-white/30 transition">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold">{agent.name}</h3>
    <TierBadge tier={agent.tier} />
  </div>
  
  <div class="flex items-center gap-2 mb-3">
    <div class="w-2 h-2 rounded-full {agent.available ? 'bg-green-500' : 'bg-gray-500'}"></div>
    <span class="text-sm text-muted">{agent.available ? 'Available' : 'Busy'}</span>
  </div>

  <!-- Reputation bar -->
  <div class="mb-3">
    <div class="flex justify-between text-sm mb-1">
      <span class="text-muted">Reputation</span>
      <span>{agent.reputation}/100</span>
    </div>
    <div class="w-full bg-gray-700 rounded-full h-2">
      <div class="bg-primary rounded-full h-2" style="width: {agent.reputation}%"></div>
    </div>
  </div>

  <!-- Skills -->
  <div class="flex flex-wrap gap-2">
    {#each agent.skills as skill}
      <span class="bg-white/10 text-xs px-2 py-1 rounded">{skill}</span>
    {/each}
  </div>
</a>
```

**JobCard.svelte**
```svelte
<script lang="ts">
  import type { Job } from '$lib/types';
  import StatusBadge from './StatusBadge.svelte';

  let { job }: { job: Job } = $props();
</script>

<a href="/jobs/{job.id}"
   class="block bg-surface rounded-xl p-6 border border-white/10 hover:border-white/30 transition">
  <div class="flex items-center justify-between mb-3">
    <h3 class="font-semibold">{job.taskType}</h3>
    <StatusBadge status={job.status} />
  </div>
  
  <div class="flex justify-between text-sm text-muted">
    <span>{job.budget} ETH</span>
    <span>{job.agent ? `Agent: ${job.agent.slice(0, 6)}...` : 'Unassigned'}</span>
  </div>
</a>
```

## Step 4: Route Pages (Placeholder Content)

**/ (Landing) — src/routes/+page.svelte**
- Hero section: Title "Hire an AI Agent", subtitle, CTA button → /agents
- 3 feature cards: "Trustless Escrow", "Earned Reputation", "Instant Matching"
- Stats placeholder: "X Agents | Y Jobs | Z ETH Volume"

**/agents — src/routes/agents/+page.svelte**
- Search input + filter row (Tier dropdown, Availability toggle)
- Grid of AgentCard components (use 5 mock agents from a local array)
- Loading skeleton with animate-pulse

**/agents/[address] — src/routes/agents/[address]/+page.svelte**
- Agent profile placeholder (populated in P4)
- Use `$page.params.address` from `$app/stores`

**/jobs — src/routes/jobs/+page.svelte**
- Status filter tabs (All, Open, In Progress, Completed)
- Grid/list of JobCard components (use 5 mock jobs)

**/jobs/new — src/routes/jobs/new/+page.svelte**
- Job creation form placeholder (populated in P4)
- Task type dropdown, budget input, deadline, description textarea
- Submit button (disabled, no handler yet)

**/dashboard — src/routes/dashboard/+page.svelte**
- Tab: "Buyer" | "Agent"
- Placeholder content per tab

## Step 5: Static Adapter Configuration

**`frontend/svelte.config.js`**
```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: true,
    }),
  },
};
```

Install if not present:
```bash
npm install -D @sveltejs/adapter-static
```

## Step 6: Verify

```bash
cd projects/synthesis/frontend
npm run build   # Must succeed
npm run dev     # All routes load
```

## Completion

Update MANIFEST.md:
- [x] P3: Wallet state module (Svelte 5 runes)
- [x] P3: Layout with AppKit button
- [x] P3: 4 shared components (TierBadge, StatusBadge, AgentCard, JobCard)
- [x] P3: 6 route pages with placeholder content
- [x] P3: Static adapter configured
- [x] P3: npm run build succeeds
```

---

## Verification Checklist

- [ ] `src/lib/stores/wallet.svelte.ts` uses $state (NOT writable())
- [ ] `src/routes/+layout.svelte` uses `$props()` and `{@render children()}`
- [ ] `src/routes/+layout.svelte` imports `$lib/appkit` and has `<appkit-button />`
- [ ] All components use `let { prop } = $props()` (NOT `export let prop`)
- [ ] TierBadge uses bg-apprentice, bg-proven, bg-expert (custom @theme colors)
- [ ] No `tailwind.config.js` exists (v4 uses CSS @theme)
- [ ] No `+page.server.ts` files exist (SPA mode)
- [ ] All 6 route pages exist with placeholder content
- [ ] `svelte.config.js` uses adapter-static with fallback
- [ ] `npm run build` succeeds
- [ ] MANIFEST.md updated with P3 check

---

**End of P3**
