# Phase 4: Frontend Dashboard & Job Flows

**Phase:** P4-FRONTEND-DASHBOARD  
**Est. Context:** ~35K tokens (under 50% budget)  
**Dependencies:** P3-FRONTEND-CORE (wallet store, layout, shared components, route skeletons), P1-CONTRACTS-CORE (contract ABIs for types)  
**Output:** Agent dashboard, buyer dashboard, job creation form, job detail page, contract interaction hooks  

---

## CRITICAL: Technology Constraints

1. **Svelte 5 runes** — Use `$state`, `$derived`, `$props()`, `$effect`. Do NOT use `writable()` stores for component state.
2. **TailwindCSS v4** — Config is CSS-based (`@theme` block). No `tailwind.config.js`. Custom colors: bg-apprentice, bg-proven, bg-expert.
3. **Reown AppKit** — Wallet via `<appkit-button />` web component. Import `appKit` from `$lib/appkit` for programmatic access.
4. **SPA mode** — No `+page.server.ts` files. Data loading via `onMount()` or `$effect`.
5. **Component props** — Use `let { prop } = $props()` NOT `export let prop`.

---

## Build Prompt

```
You are building Phase 4 of the Agent Work Marketplace — the interactive dashboard and job flow pages.

IMPORTANT: Follow Svelte 5 syntax. Use $state/$derived/$props() runes. Do NOT use writable() stores. Component props must use let { x } = $props().

## Pre-flight

READ THESE FILES FIRST:
1. projects/synthesis/MANIFEST.md — source of truth, check current state
2. projects/synthesis/PRD.md — sections 4 (User Flows), 5.2 (Contract Specs), 6 (Task Types)
3. projects/synthesis/frontend/src/lib/types.ts — existing type definitions from P3
4. projects/synthesis/frontend/src/lib/stores/wallet.ts — existing wallet store from P3
5. projects/synthesis/frontend/src/lib/components/ — existing shared components from P3

## Context

The frontend scaffold (P3) created:
- SvelteKit app with TailwindCSS
- Wallet connection via Web3Modal + wagmi
- Shared components: AgentCard, JobCard, TierBadge, StatusBadge, ConnectButton
- Route skeletons: /, /agents, /jobs, /jobs/new, /dashboard
- Type definitions in src/lib/types.ts

Your job: Build the INTERACTIVE pages with contract read/write hooks (using placeholder data until P5 wires real contracts).

## Build Order

### 1. Contract Interaction Hooks (src/lib/contracts/hooks.ts)

Create a module of async functions that will later call real contracts. For now, use mock data.

```typescript
// src/lib/contracts/hooks.ts
import type { Agent, Job, ReputationScore } from '$lib/types';

// --- READ FUNCTIONS (mock for now, real in P5) ---

export async function fetchAgents(filters?: {
  tier?: string;
  skill?: string;
  available?: boolean;
}): Promise<Agent[]>

export async function fetchAgent(address: string): Promise<Agent | null>

export async function fetchJobs(filters?: {
  status?: string;
  buyer?: string;
  agent?: string;
}): Promise<Job[]>

export async function fetchJob(jobId: string): Promise<Job | null>

export async function fetchReputation(address: string): Promise<ReputationScore>

export async function fetchLeaderboard(offset: number, limit: number): Promise<{agents: Agent[], scores: number[]}>

// --- WRITE FUNCTIONS (stub for now, real in P5) ---

export async function registerAgent(params: {
  erc8004Identity: string;
  metadataURI: string;
  skills: string[];
}): Promise<{ txHash: string }>

export async function createJob(params: {
  taskType: string;
  budget: string; // ETH amount
  deadline: number; // Unix timestamp
  description: string;
}): Promise<{ txHash: string; jobId: string }>

export async function acceptJob(jobId: string, stakeAmount: string): Promise<{ txHash: string }>

export async function submitDeliverable(jobId: string, deliverableURI: string): Promise<{ txHash: string }>

export async function confirmDelivery(jobId: string): Promise<{ txHash: string }>

export async function cancelJob(jobId: string): Promise<{ txHash: string }>
```

Provide 5 mock agents and 8 mock jobs as default return data. Agents should span all 3 tiers. Jobs should cover all statuses.

### 2. Notification Store (src/lib/stores/notifications.svelte.ts)

Use Svelte 5 runes for reactive notification state:

```typescript
// src/lib/stores/notifications.svelte.ts
// Svelte 5 rune-based notification state

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration: number; // ms, 0 = sticky
}

let notifications = $state<Notification[]>([]);

export function getNotifications() {
  return { get list() { return notifications; } };
}

export function notify(type: Notification['type'], title: string, message: string, duration = 5000): void {
  const id = crypto.randomUUID();
  notifications = [...notifications, { id, type, title, message, duration }];
  if (duration > 0) {
    setTimeout(() => dismiss(id), duration);
  }
}

export function dismiss(id: string): void {
  notifications = notifications.filter(n => n.id !== id);
}
```

### 3. Toast Component (src/lib/components/Toast.svelte)

- Renders notifications from store
- Auto-dismiss after duration
- Manual dismiss via X button
- Position: top-right, stacked
- Styles: success=green, error=red, warning=yellow, info=blue
- Animate in/out with CSS transitions

### 4. Agent Browse Page (src/routes/agents/+page.svelte)

Replace P3 placeholder with functional page:
- Search bar: filter by name or skill
- Filter row: Tier dropdown (All, Apprentice, Proven, Expert), Availability toggle
- Grid layout (3 columns desktop, 1 mobile) of AgentCard components
- Loading skeleton while fetching
- Empty state: "No agents found matching your criteria"
- Click AgentCard → navigate to /agents/[address]

### 5. Agent Profile Page (src/routes/agents/[address]/+page.svelte)

Create new route with:
- Header: Agent name, tier badge, availability status, wallet address (truncated)
- Reputation section: Composite score (large number), bar chart for component scores (technical, reliability, collaboration)
- Skills: Tag list
- Job history: Table of past jobs (task type, buyer, value, outcome, date)
- Stats: Total jobs, success rate, avg completion time, total earned
- If viewing own profile: "Edit Profile" button

### 6. Job Creation Page (src/routes/jobs/new/+page.svelte)

Replace P3 placeholder with full form:
- Task Type: Dropdown (Smart Contract Review, Test Generation, Documentation, Code Snippet Review)
- Budget: ETH input with USD estimate placeholder
- Deadline: Date picker (minimum = now + 12h)
- Description: Textarea (max 1000 chars, char counter)
- Wallet check: If not connected, show "Connect wallet to create job" instead of form
- Submit: Call createJob hook, show pending toast, redirect to /jobs/[id] on success
- Validation: All fields required, budget > 0, deadline in future

### 7. Job Detail Page (src/routes/jobs/[id]/+page.svelte)

Create new route with status-dependent UI:

**All statuses show:**
- Job ID, task type, budget, deadline, created date
- StatusBadge (large)
- Buyer address, agent address (if assigned)

**Status-specific sections:**

| Status | Buyer View | Agent View |
|--------|-----------|------------|
| Open | "Cancel Job" button | "Accept Job" button (with stake info) |
| Assigned | Waiting message | "Accept" button (confirm + stake) |
| InProgress | Progress indicator | "Submit Deliverable" form (file upload + URI input) |
| Delivered | "Confirm Delivery" + "File Dispute" buttons, deliverable link | Waiting message, auto-release countdown |
| Disputed | Dispute status | Dispute status |
| Complete | Payment receipt, rating form (future) | Earnings receipt |
| Cancelled | Refund confirmation | N/A |

**Auto-release countdown:**
- Show "Auto-release in X hours" when status = Delivered
- Calculate from deliveredAt + 72h
- Update every minute

### 8. Buyer Dashboard (src/routes/dashboard/buyer/+page.svelte)

- Stats row: Total spent, Active jobs, Completed jobs
- Tab: Active Jobs | Completed Jobs | Cancelled Jobs
- Each tab: List of JobCards filtered by status
- Empty state per tab

### 9. Agent Dashboard (src/routes/dashboard/agent/+page.svelte)

- Stats row: Total earned, Active jobs, Reputation score, Tier badge
- Tab: Available Jobs (can accept) | My Active Jobs | Completed Jobs
- Available Jobs: List of Open jobs matching agent's skills
- My Active Jobs: Jobs assigned to this agent
- Completed: Past jobs with earnings

### 10. Dashboard Router (src/routes/dashboard/+page.svelte)

- Detect if connected wallet is registered agent → show Agent Dashboard
- Otherwise → show Buyer Dashboard
- Toggle: "Switch to Buyer View" / "Switch to Agent View" for agents who are also buyers

## Styling Guidelines

- All pages use dark theme (bg-gray-900)
- Cards: bg-gray-800 rounded-xl p-6 border border-gray-700
- Hover states on clickable cards: border-gray-500 transition
- Forms: bg-gray-800 inputs with gray-700 borders
- Buttons: Primary (blue-600 hover:blue-700), Danger (red-600 hover:red-700), Secondary (gray-600)
- Loading: Pulse animation skeletons matching card shapes
- Mobile responsive: Stack to single column below 768px

## TypeScript Requirements

- Extend src/lib/types.ts if needed (do NOT duplicate)
- All component props typed
- All hook return types defined
- No `any` types

## Verification

1. Run `npm run build` — must succeed
2. Run `npm run dev` — navigate all routes manually
3. Verify: Agent browse shows mock data, filters work
4. Verify: Job creation form validates and shows toast on submit
5. Verify: Job detail page shows correct UI per mock status
6. Verify: Dashboard switches between buyer/agent views

## Completion

Update MANIFEST.md:
- [x] P4: Contract hooks module with mock data
- [x] P4: Notification store + Toast component
- [x] P4: Agent browse + profile pages
- [x] P4: Job creation + detail pages
- [x] P4: Buyer + Agent dashboards
- [x] P4: npm run build succeeds
```

---

## Verification Checklist

- [ ] src/lib/contracts/hooks.ts exists with all read/write stubs
- [ ] Mock data returns 5 agents (all tiers) and 8 jobs (all statuses)
- [ ] src/lib/stores/notifications.ts exists with notify/dismiss
- [ ] Toast component renders and auto-dismisses
- [ ] Agent browse: search, filter, grid layout, loading skeleton, empty state
- [ ] Agent profile: reputation display, job history, stats
- [ ] Job creation: validation, wallet check, submit flow with toast
- [ ] Job detail: status-dependent UI for all 7 statuses
- [ ] Job detail: auto-release countdown when Delivered
- [ ] Buyer dashboard: stats, tabs, filtered job lists
- [ ] Agent dashboard: stats, available/active/completed tabs
- [ ] Dashboard router: auto-detect agent vs buyer
- [ ] All pages mobile responsive
- [ ] No TypeScript errors
- [ ] `npm run build` succeeds
- [ ] MANIFEST.md updated
