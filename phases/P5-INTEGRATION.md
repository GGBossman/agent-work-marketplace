# Phase 5: Integration — Contracts ↔ Frontend
## Agent Work Marketplace

**Phase:** P5  
**Est. Tokens:** ~25K  
**Depends On:** P1 (Contracts Core), P2 (Contracts Reputation), P3 (Frontend Core), P4 (Frontend Dashboard)  
**Produces:** ABI exports, contract hooks, full frontend ↔ contract wiring  
**Next Phase:** P6 (Testing)

---

## Pre-Execution Checklist

1. Read `projects/synthesis/MANIFEST.md` — check P1, P2, P3, P4 are all ✅
2. Verify contracts compile: `cd projects/synthesis/contracts && forge build`
3. Verify frontend builds: `cd projects/synthesis/frontend && npm run build`
4. Read these files to understand current state:
   - `contracts/src/JobEscrow.sol`
   - `contracts/src/AgentRegistry.sol`
   - `contracts/src/ReputationEngine.sol`
   - `frontend/src/lib/contracts/abis.ts`
   - `frontend/src/lib/contracts/addresses.ts`
   - `frontend/src/lib/stores/wallet.ts`

---

## CRITICAL: Technology Constraints

1. **Foundry PATH** — `export PATH="$HOME/.foundry/bin:$PATH"` before any forge command
2. **Svelte 5** — Use `$state`/`$derived`/`$props()` runes. NOT `writable()` stores.
3. **Reown AppKit** — Wallet connection managed by AppKit. Use `@wagmi/core` (vanilla JS) for contract reads/writes — NOT `wagmi` React hooks.
4. **TailwindCSS v4** — CSS-based config. No `tailwind.config.js`.
5. **IPFS SDK** — Use `pinata` v2.5.5 (latest official SDK).
6. **SPA mode** — No `+page.server.ts`. All data loading client-side.

---

## Build Prompt

You are wiring the smart contracts to the SvelteKit frontend for **Agent Work Marketplace**. The contracts are built (P1/P2) and the frontend pages exist (P3/P4). Your job is to connect them.

IMPORTANT: Use @wagmi/core actions (getAccount, readContract, writeContract, waitForTransactionReceipt) — these are VanillaJS functions, NOT React hooks. The wagmi config is managed by Reown AppKit internally via WagmiAdapter.

### Step 1: Export ABIs from Foundry

After `forge build`, ABIs are in `contracts/out/`. Extract them:

```bash
cd projects/synthesis

# Extract ABIs to frontend
node -e "
const fs = require('fs');
const contracts = ['JobEscrow', 'AgentRegistry', 'ReputationEngine'];
const abis = {};
for (const name of contracts) {
  const artifact = JSON.parse(fs.readFileSync('contracts/out/' + name + '.sol/' + name + '.json', 'utf-8'));
  abis[name] = artifact.abi;
}
fs.writeFileSync('frontend/src/lib/contracts/abis.ts',
  contracts.map(name =>
    'export const ' + name.replace(/([A-Z])/g, '_$1').toUpperCase().slice(1) + '_ABI = ' + JSON.stringify(abis[name], null, 2) + ' as const;'
  ).join('\n\n')
);
console.log('ABIs exported successfully');
"
```

### Step 2: Create Contract Hook Library

**`frontend/src/lib/contracts/hooks.ts`**

Create typed hooks for each contract interaction:

```typescript
import { getContract, type PublicClient, type WalletClient } from 'viem';
import { CONTRACTS } from './addresses';
import { JOB_ESCROW_ABI, AGENT_REGISTRY_ABI, REPUTATION_ENGINE_ABI } from './abis';

// --- JobEscrow Hooks ---

export async function createJob(
  walletClient: WalletClient,
  publicClient: PublicClient,
  taskType: string,
  value: bigint
) {
  const taskTypeBytes = stringToBytes32(taskType);
  const hash = await walletClient.writeContract({
    address: CONTRACTS.JOB_ESCROW,
    abi: JOB_ESCROW_ABI,
    functionName: 'createJob',
    args: [taskTypeBytes, value],
    value: value,
  });
  return publicClient.waitForTransactionReceipt({ hash });
}

export async function assignAgent(
  walletClient: WalletClient,
  publicClient: PublicClient,
  jobId: `0x${string}`,
  agent: `0x${string}`
) {
  const hash = await walletClient.writeContract({
    address: CONTRACTS.JOB_ESCROW,
    abi: JOB_ESCROW_ABI,
    functionName: 'assignAgent',
    args: [jobId, agent],
  });
  return publicClient.waitForTransactionReceipt({ hash });
}

export async function agentAccept(
  walletClient: WalletClient,
  publicClient: PublicClient,
  jobId: `0x${string}`,
  stakeAmount: bigint
) {
  const hash = await walletClient.writeContract({
    address: CONTRACTS.JOB_ESCROW,
    abi: JOB_ESCROW_ABI,
    functionName: 'agentAccept',
    args: [jobId],
    value: stakeAmount,
  });
  return publicClient.waitForTransactionReceipt({ hash });
}

export async function submitDeliverable(
  walletClient: WalletClient,
  publicClient: PublicClient,
  jobId: `0x${string}`,
  deliverableURI: string
) {
  const hash = await walletClient.writeContract({
    address: CONTRACTS.JOB_ESCROW,
    abi: JOB_ESCROW_ABI,
    functionName: 'submitDeliverable',
    args: [jobId, deliverableURI],
  });
  return publicClient.waitForTransactionReceipt({ hash });
}

export async function confirmDelivery(
  walletClient: WalletClient,
  publicClient: PublicClient,
  jobId: `0x${string}`
) {
  const hash = await walletClient.writeContract({
    address: CONTRACTS.JOB_ESCROW,
    abi: JOB_ESCROW_ABI,
    functionName: 'confirmDelivery',
    args: [jobId],
  });
  return publicClient.waitForTransactionReceipt({ hash });
}

export async function initiateAutoRelease(
  walletClient: WalletClient,
  publicClient: PublicClient,
  jobId: `0x${string}`
) {
  const hash = await walletClient.writeContract({
    address: CONTRACTS.JOB_ESCROW,
    abi: JOB_ESCROW_ABI,
    functionName: 'initiateAutoRelease',
    args: [jobId],
  });
  return publicClient.waitForTransactionReceipt({ hash });
}

// --- AgentRegistry Hooks ---

export async function registerAgent(
  walletClient: WalletClient,
  publicClient: PublicClient,
  erc8004Identity: `0x${string}`,
  metadataURI: string,
  skills: string[]
) {
  const hash = await walletClient.writeContract({
    address: CONTRACTS.AGENT_REGISTRY,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'registerAgent',
    args: [erc8004Identity, metadataURI, skills],
  });
  return publicClient.waitForTransactionReceipt({ hash });
}

export async function updateAvailability(
  walletClient: WalletClient,
  publicClient: PublicClient,
  available: boolean
) {
  const hash = await walletClient.writeContract({
    address: CONTRACTS.AGENT_REGISTRY,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'updateAvailability',
    args: [available],
  });
  return publicClient.waitForTransactionReceipt({ hash });
}

export async function stakeForTier(
  walletClient: WalletClient,
  publicClient: PublicClient,
  amount: bigint
) {
  const hash = await walletClient.writeContract({
    address: CONTRACTS.AGENT_REGISTRY,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'stakeForTier',
    args: [amount],
    value: amount,
  });
  return publicClient.waitForTransactionReceipt({ hash });
}

// --- ReputationEngine Hooks ---

export async function getReputation(
  publicClient: PublicClient,
  agent: `0x${string}`
) {
  return publicClient.readContract({
    address: CONTRACTS.REPUTATION_ENGINE,
    abi: REPUTATION_ENGINE_ABI,
    functionName: 'calculateReputation',
    args: [agent],
  });
}

// --- Read Functions ---

export async function getJob(
  publicClient: PublicClient,
  jobId: `0x${string}`
) {
  return publicClient.readContract({
    address: CONTRACTS.JOB_ESCROW,
    abi: JOB_ESCROW_ABI,
    functionName: 'getJob',
    args: [jobId],
  });
}

export async function getAgentProfile(
  publicClient: PublicClient,
  agent: `0x${string}`
) {
  return publicClient.readContract({
    address: CONTRACTS.AGENT_REGISTRY,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'getAgent',
    args: [agent],
  });
}

export async function getEligibleAgents(
  publicClient: PublicClient,
  taskType: string
) {
  const taskTypeBytes = stringToBytes32(taskType);
  return publicClient.readContract({
    address: CONTRACTS.AGENT_REGISTRY,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'getEligibleAgents',
    args: [taskTypeBytes],
  });
}

// --- Utilities ---

function stringToBytes32(str: string): `0x${string}` {
  const hex = Buffer.from(str).toString('hex').padEnd(64, '0');
  return `0x${hex}`;
}
```

### Step 3: Create Event Listener Store

**`frontend/src/lib/stores/events.ts`**

```typescript
import { writable } from 'svelte/store';
import type { Log } from 'viem';

// Store for real-time contract events
export const jobEvents = writable<Log[]>([]);
export const agentEvents = writable<Log[]>([]);

// Event listener setup function
export function setupEventListeners(publicClient: any) {
  // Watch for JobCreated events
  publicClient.watchContractEvent({
    address: CONTRACTS.JOB_ESCROW,
    abi: JOB_ESCROW_ABI,
    eventName: 'JobCreated',
    onLogs: (logs: Log[]) => {
      jobEvents.update(existing => [...existing, ...logs]);
    },
  });

  // Watch for JobAssigned events
  publicClient.watchContractEvent({
    address: CONTRACTS.JOB_ESCROW,
    abi: JOB_ESCROW_ABI,
    eventName: 'JobAssigned',
    onLogs: (logs: Log[]) => {
      jobEvents.update(existing => [...existing, ...logs]);
    },
  });

  // Watch for PaymentReleased events
  publicClient.watchContractEvent({
    address: CONTRACTS.JOB_ESCROW,
    abi: JOB_ESCROW_ABI,
    eventName: 'PaymentReleased',
    onLogs: (logs: Log[]) => {
      jobEvents.update(existing => [...existing, ...logs]);
    },
  });
}
```

### Step 4: Wire Wallet State to Reown AppKit

Reown AppKit manages the wallet connection internally. Use `@wagmi/core` actions with the AppKit-managed config for contract interactions.

Update **`frontend/src/lib/stores/wallet.svelte.ts`** (Svelte 5 runes):

```typescript
// src/lib/stores/wallet.svelte.ts
import { browser } from '$app/environment';
import { getAccount, watchAccount } from '@wagmi/core';
import { appKit } from '$lib/appkit';

// Svelte 5 reactive state
let address = $state<`0x${string}` | null>(null);
let isConnected = $state(false);
let chainId = $state<number | null>(null);

export function getWalletState() {
  return {
    get address() { return address; },
    get isConnected() { return isConnected; },
    get chainId() { return chainId; },
  };
}

// Initialize wallet listener (call once from +layout.svelte)
export function initWalletWatcher(wagmiConfig: any) {
  if (!browser) return;

  // Read initial state
  const account = getAccount(wagmiConfig);
  address = account.address ?? null;
  isConnected = account.isConnected;
  chainId = account.chainId ?? null;

  // Watch for changes
  watchAccount(wagmiConfig, {
    onChange(account) {
      address = account.address ?? null;
      isConnected = account.isConnected;
      chainId = account.chainId ?? null;
    },
  });
}

// Programmatic modal control
export function openConnectModal() {
  appKit?.open({ view: 'Connect' });
}

export function openAccountModal() {
  appKit?.open({ view: 'Account' });
}
```

**Note:** The `<appkit-button />` web component handles connect/disconnect UI. This module provides reactive state for other components to read.

### Step 5: Wire Each Frontend Page to Contract Hooks

For each page that was created in P3/P4, add the actual contract calls:

**Pattern for all pages:**
1. Import hooks from `$lib/contracts/hooks`
2. Import wallet store from `$lib/stores/wallet`
3. Replace mock data with actual contract reads
4. Replace form submissions with actual contract writes
5. Add loading states and error handling
6. Add transaction confirmation UI (tx hash link to BaseScan)

**Key pages to wire:**
- `routes/agents/+page.svelte` → `getEligibleAgents()`, `getReputation()`
- `routes/agents/[id]/+page.svelte` → `getAgentProfile()`, `getReputation()`
- `routes/jobs/+page.svelte` → `createJob()`
- `routes/jobs/[id]/+page.svelte` → `getJob()`, `confirmDelivery()`, `submitDeliverable()`
- `routes/dashboard/agent/+page.svelte` → `registerAgent()`, `updateAvailability()`, `agentAccept()`
- `routes/dashboard/buyer/+page.svelte` → `createJob()`, `confirmDelivery()`

### Step 6: Add Transaction Toast/Notification Component

**`frontend/src/lib/components/TxToast.svelte`**

Create a toast notification that shows:
- "Transaction pending..." with spinner
- "Transaction confirmed!" with BaseScan link
- "Transaction failed" with error message

Use this component in every page that makes a contract call.

### Step 7: Add Chain Switching

If user is on wrong chain, prompt to switch to Base:

```typescript
export async function switchToBase() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x2105' }], // 8453 in hex
    });
  } catch (error: any) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x2105',
          chainName: 'Base',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://mainnet.base.org'],
          blockExplorerUrls: ['https://basescan.org'],
        }],
      });
    }
  }
}
```

### Step 8: Verify Integration

```bash
cd projects/synthesis/frontend
npm run build    # Should compile with no type errors
npm run dev      # Should render pages with wallet connect
```

```bash
cd projects/synthesis/contracts
forge build      # Should still compile
```

### Step 9: Git Commit

```bash
cd projects/synthesis
git add -A
git commit -m "P5: Integration — contracts wired to frontend via typed hooks"
```

---

## Verification Checklist

- [ ] ABIs exported from Foundry to `frontend/src/lib/contracts/abis.ts`
- [ ] Contract hooks file created with all write + read functions
- [ ] Event listener store created
- [ ] Wallet store updated with real Web3Modal connection
- [ ] `createJob` wired to job creation page
- [ ] `registerAgent` wired to agent registration
- [ ] `getReputation` wired to agent browse/profile pages
- [ ] `confirmDelivery` wired to job detail page
- [ ] `submitDeliverable` wired to agent job view
- [ ] Transaction toast/notification component created
- [ ] Chain switching to Base implemented
- [ ] Frontend builds with zero type errors
- [ ] Contracts still compile
- [ ] Git committed

---

## Post-Phase Actions

1. Update `MANIFEST.md` Phase Status: P5 → ✅ Complete
2. Proceed to P6 (Testing)

---

## Cross-References

- Contract function signatures: `contracts/src/interfaces/I*.sol`
- Frontend page structure: `frontend/src/routes/`
- Contract addresses (post-deploy): `frontend/src/lib/contracts/addresses.ts`
- Constants: See MANIFEST.md → Key Constants section

---

**End of P5**
