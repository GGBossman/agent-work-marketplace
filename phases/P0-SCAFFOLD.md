# Phase 0: Project Scaffold
## Agent Work Marketplace

**Phase:** P0  
**Est. Tokens:** ~3K (lightest phase)  
**Depends On:** Nothing  
**Produces:** Project skeleton, configs, dependency files  
**Next Phase:** P1 (Contracts Core) or P3 (Frontend Core) — can run in parallel

---

## Pre-Execution Checklist

1. Read `projects/synthesis/MANIFEST.md` — understand full project scope
2. Read `projects/synthesis/PRD.md` sections 5.1 (Architecture) and 8 (Launch Scope)
3. Confirm working directory: `projects/synthesis/`

---

## CRITICAL: Environment Setup

**Foundry PATH** — forge is installed but NOT in default PATH. Run this FIRST in every terminal session:
```bash
export PATH="$HOME/.foundry/bin:$PATH"
```

**Foundry version:** v1.5.1 — uses `--no-git` flag (NOT `--no-commit` which was removed).

---

## Build Prompt

You are building the project scaffold for **Agent Work Marketplace**, a decentralized marketplace for AI agent services on Base. This phase creates the skeleton only — no business logic.

### Step 1: Initialize Foundry Project

```bash
export PATH="$HOME/.foundry/bin:$PATH"
cd projects/synthesis
mkdir -p contracts
cd contracts
forge init --no-git
```

### Step 2: Configure foundry.toml

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.24"
optimizer = true
optimizer_runs = 200
via_ir = false
evm_version = "cancun"

[profile.default.fuzz]
runs = 256

[rpc_endpoints]
base = "https://mainnet.base.org"
base_sepolia = "https://sepolia.base.org"

[etherscan]
base = { key = "${BASESCAN_API_KEY}", url = "https://api.basescan.org/api" }
```

### Step 3: Install Solidity Dependencies

```bash
export PATH="$HOME/.foundry/bin:$PATH"
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-git
forge install safe-global/safe-smart-account --no-git
```

**Note:** safe-global org redirects to safe-fndn. `forge install` follows the redirect automatically.

### Step 4: Create remappings.txt

```
@openzeppelin/=lib/openzeppelin-contracts/
@safe-global/=lib/safe-smart-account/
```

### Step 5: Create Contract Stubs

Create empty contract files with correct structure:

**`src/interfaces/IJobEscrow.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IJobEscrow {
    // Populated in P1
}
```

**`src/interfaces/IAgentRegistry.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAgentRegistry {
    // Populated in P1
}
```

**`src/interfaces/IReputationEngine.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReputationEngine {
    // Populated in P2
}
```

**`src/JobEscrow.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IJobEscrow.sol";

contract JobEscrow is IJobEscrow {
    // Populated in P1
}
```

**`src/AgentRegistry.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IAgentRegistry.sol";

contract AgentRegistry is IAgentRegistry {
    // Populated in P1
}
```

**`src/ReputationEngine.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IReputationEngine.sol";

contract ReputationEngine is IReputationEngine {
    // Populated in P2
}
```

**`script/Deploy.s.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

contract Deploy is Script {
    // Populated in P7
}
```

Create test stubs:

**`test/JobEscrow.t.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/JobEscrow.sol";

contract JobEscrowTest is Test {
    // Populated in P6
}
```

**`test/AgentRegistry.t.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/AgentRegistry.sol";

contract AgentRegistryTest is Test {
    // Populated in P6
}
```

**`test/ReputationEngine.t.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ReputationEngine.sol";

contract ReputationEngineTest is Test {
    // Populated in P6
}
```

**`test/Integration.t.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

contract IntegrationTest is Test {
    // Populated in P6
}
```

### Step 6: Initialize SvelteKit Project

**IMPORTANT:** SvelteKit now uses `npx sv create` (not `npm create svelte@latest`). This scaffolds Svelte 5.

```bash
cd projects/synthesis
npx sv create frontend --template minimal --types ts --no-add-ons --no-install
cd frontend
npm install
```

### Step 7: Install Frontend Dependencies

**Web3 — use Reown AppKit (supports SvelteKit natively):**
```bash
npm install @reown/appkit @reown/appkit-adapter-wagmi wagmi viem
```

**IMPORTANT:** Do NOT use `@web3modal/wagmi` (deprecated) or `wagmi` directly (React-only hooks).
Reown AppKit wraps wagmi internally and provides Svelte-compatible web components (`<appkit-button />`).

**Styling — TailwindCSS v4 (CSS-native config, no tailwind.config.js):**
```bash
npm install tailwindcss @tailwindcss/vite
```

**IMPORTANT:** TailwindCSS v4 does NOT use `tailwind.config.js` or `npx tailwindcss init`. Configuration is done in CSS.

### Step 8: Configure Tailwind v4 for SvelteKit

**`frontend/vite.config.ts`**
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
  ],
});
```

**`frontend/src/app.css`**
```css
@import "tailwindcss";

/* Custom theme — replaces tailwind.config.js in v4 */
@theme {
  --color-primary: #6366f1;
  --color-secondary: #8b5cf6;
  --color-accent: #06b6d4;
  --color-dark: #0f172a;
  --color-surface: #1e293b;
  --color-muted: #94a3b8;
  --color-apprentice: #4B5563;
  --color-proven: #2563EB;
  --color-expert: #EAB308;
}
```

**`frontend/src/routes/+layout.svelte`**
```svelte
<script>
  let { children } = $props();
  import "../app.css";
</script>

{@render children()}
```

### Step 9: Configure Reown AppKit for Svelte

**`frontend/src/lib/appkit.ts`**
```typescript
import { browser } from '$app/environment';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia } from '@reown/appkit/networks';

let appKit: ReturnType<typeof createAppKit> | undefined = undefined;

if (browser) {
  const projectId = import.meta.env.VITE_PROJECT_ID || 'demo-project-id';

  const wagmiAdapter = new WagmiAdapter({
    networks: [base, baseSepolia],
    projectId,
  });

  appKit = createAppKit({
    adapters: [wagmiAdapter],
    networks: [base, baseSepolia],
    defaultNetwork: base,
    projectId,
    metadata: {
      name: 'Agent Work Marketplace',
      description: 'Hire an AI agent. Trust the work. Verify on-chain.',
      url: 'https://agentwork.market',
      icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4'],
    },
  });
}

export { appKit };
```

**Note:** Obtain a WalletConnect Project ID from https://cloud.walletconnect.com and set it in `.env.local` as `VITE_PROJECT_ID`. For initial scaffold, the fallback string is fine.

### Step 10: Create Frontend Directory Structure

```bash
cd frontend/src
mkdir -p lib/contracts lib/stores lib/components lib/utils
mkdir -p routes/agents routes/agents/"[address]"
mkdir -p routes/jobs routes/jobs/new routes/jobs/"[id]"
mkdir -p routes/dashboard routes/dashboard/agent routes/dashboard/buyer
```

Create placeholder files:

**`frontend/src/lib/contracts/addresses.ts`**
```typescript
// Contract addresses — populated after deployment (P7)
export const CONTRACTS = {
  JOB_ESCROW: '' as `0x${string}`,
  AGENT_REGISTRY: '' as `0x${string}`,
  REPUTATION_ENGINE: '' as `0x${string}`,
} as const;

export const CHAIN_ID = 8453; // Base Mainnet
```

**`frontend/src/lib/contracts/abis.ts`**
```typescript
// ABIs — populated after contract compilation (P5)
export const JOB_ESCROW_ABI = [] as const;
export const AGENT_REGISTRY_ABI = [] as const;
export const REPUTATION_ENGINE_ABI = [] as const;
```

**`frontend/src/lib/types.ts`**
```typescript
// Shared types — populated in P3
export type AgentTier = 'Apprentice' | 'Proven' | 'Expert';
export type JobStatus = 'Open' | 'Assigned' | 'InProgress' | 'Delivered' | 'Disputed' | 'Complete' | 'Cancelled';

export interface Agent {
  address: string;
  name: string;
  tier: AgentTier;
  reputation: number;
  skills: string[];
  available: boolean;
}

export interface Job {
  id: string;
  taskType: string;
  budget: string;
  status: JobStatus;
  deadline: number;
  buyer: string;
  agent: string | null;
}
```

**`frontend/.env.example`**
```
VITE_PROJECT_ID=your_walletconnect_project_id
VITE_CHAIN_ID=84532
```

### Step 11: Create .gitignore

**`projects/synthesis/.gitignore`**
```
# Foundry
contracts/out/
contracts/cache/
contracts/lib/

# Node
frontend/node_modules/
frontend/.svelte-kit/
frontend/build/

# Environment
.env
.env.local
.env.production

# OS
.DS_Store
*.swp
```

### Step 12: Create Root README Stub

**`projects/synthesis/README.md`**
```markdown
# Agent Work Marketplace

> Hire an AI agent. Trust the work. Verify on-chain.

The first decentralized marketplace where AI agents offer verifiable skills
and humans hire them with trustless escrow on Base.

## Architecture

- **Contracts:** Foundry (Solidity 0.8.24)
- **Frontend:** SvelteKit 5 + TailwindCSS v4
- **Web3:** Reown AppKit + wagmi/viem
- **Chain:** Base Mainnet
- **Identity:** ERC-8004

## Quick Start

### Contracts
\`\`\`bash
export PATH="$HOME/.foundry/bin:$PATH"
cd contracts
forge build
forge test
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Status

🚧 Under construction — The Synthesis Hackathon 2026

## License

MIT
```

### Step 13: Verify Build

```bash
export PATH="$HOME/.foundry/bin:$PATH"
cd projects/synthesis/contracts && forge build
cd ../frontend && npm run build
```

Both should succeed with zero errors (stubs only).

### Step 14: Git Init + First Commit

```bash
cd projects/synthesis
git init
git add -A
git commit -m "P0: Project scaffold — Foundry + SvelteKit 5 + Reown AppKit + TailwindCSS v4"
```

---

## Verification Checklist

- [ ] `contracts/foundry.toml` exists with correct config (solc 0.8.24)
- [ ] `contracts/remappings.txt` exists with OZ + Safe mappings
- [ ] All 3 interface files exist in `contracts/src/interfaces/`
- [ ] All 3 contract stubs exist in `contracts/src/`
- [ ] All 4 test stubs exist in `contracts/test/`
- [ ] Deploy script stub exists in `contracts/script/`
- [ ] `forge build` succeeds (with PATH set)
- [ ] `frontend/package.json` exists with @reown/appkit, wagmi, viem, tailwindcss, @tailwindcss/vite
- [ ] `frontend/vite.config.ts` has @tailwindcss/vite plugin
- [ ] `frontend/src/app.css` uses `@import "tailwindcss"` with `@theme` block
- [ ] `frontend/src/lib/appkit.ts` configures Reown for Base chain
- [ ] `frontend/src/routes/+layout.svelte` uses `$props()` and imports app.css
- [ ] Frontend directory structure created (routes, lib, components)
- [ ] `frontend/.env.example` exists
- [ ] `.gitignore` covers all artifacts
- [ ] README.md exists
- [ ] `npm run build` succeeds
- [ ] Git initial commit made

---

## Post-Phase Actions

1. Update `MANIFEST.md` Phase Status: P0 → ✅ Complete
2. Proceed to P1 (Contracts Core) AND/OR P3 (Frontend Core) — these are independent

---

## Technology Versions (Verified 2026-03-12)

| Package | Version | Notes |
|---------|---------|-------|
| Node.js | v22.22.0 | |
| Foundry (forge) | v1.5.1 | PATH: ~/.foundry/bin |
| Solidity | 0.8.24 | Via Foundry |
| SvelteKit | 2.54.0 | Svelte 5 |
| Svelte | 5.53.10 | Uses runes ($state, $props) |
| TailwindCSS | 4.2.1 | CSS-based config via @tailwindcss/vite |
| wagmi | 3.5.0 | Used internally by Reown AppKit |
| viem | 2.47.1 | |
| @reown/appkit | 1.8.19 | Svelte web components |
| OpenZeppelin | 5.6.1 | |

---

**End of P0**
