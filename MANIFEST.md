# MANIFEST.md — Source of Truth
## Agent Work Marketplace (The Synthesis Hackathon)

**Last Updated:** 2026-03-18T17:00+08:00  
**Version:** 2.0  
**Team:** Codex (Agent) + Stephen Cheung (Human)  
**Hackathon:** The Synthesis (14-day, starts March 13)  
**Chain:** Base Mainnet  

---

## Purpose

This file is the **single source of truth** for the entire project. If context is wiped, start here. Read this file FIRST, then read the phase prompt for whatever phase you're executing.

---

## Project Summary

A decentralized marketplace where AI agents offer verifiable skills and humans/agents hire them with trustless escrow. Reputation earned through completed work, not claimed. Portable via ERC-8004 identity on Base.

**Tagline:** *"Hire an AI agent. Trust the work. Verify on-chain."*

---

## Directory Structure (Target — Final State)

```
projects/synthesis/
├── MANIFEST.md              ← YOU ARE HERE (source of truth)
├── PRD.md                   ← Full product requirements
├── phases/                  ← Build phase prompts
│   ├── P0-SCAFFOLD.md
│   ├── P1-CONTRACTS-CORE.md
│   ├── P2-CONTRACTS-REPUTATION.md
│   ├── P3-FRONTEND-CORE.md
│   ├── P4-FRONTEND-DASHBOARD.md
│   ├── P5-INTEGRATION.md
│   ├── P6-TESTING.md
│   └── P7-DEPLOY-DOCS.md
├── contracts/               ← Solidity smart contracts
│   ├── src/
│   │   ├── JobEscrow.sol
│   │   ├── AgentRegistry.sol
│   │   ├── ReputationEngine.sol
│   │   └── interfaces/
│   │       ├── IJobEscrow.sol
│   │       ├── IAgentRegistry.sol
│   │       └── IReputationEngine.sol
│   ├── test/
│   │   ├── JobEscrow.t.sol
│   │   ├── AgentRegistry.t.sol
│   │   ├── ReputationEngine.t.sol
│   │   └── Integration.t.sol
│   ├── script/
│   │   └── Deploy.s.sol
│   ├── foundry.toml
│   └── remappings.txt
├── frontend/                ← SvelteKit application
│   ├── src/
│   │   ├── routes/
│   │   │   ├── +page.svelte          (landing)
│   │   │   ├── +layout.svelte
│   │   │   ├── agents/
│   │   │   │   ├── +page.svelte      (browse agents)
│   │   │   │   └── [id]/+page.svelte (agent profile)
│   │   │   ├── jobs/
│   │   │   │   ├── +page.svelte      (create job)
│   │   │   │   └── [id]/+page.svelte (job detail)
│   │   │   └── dashboard/
│   │   │       ├── +page.svelte      (main dashboard)
│   │   │       ├── agent/+page.svelte
│   │   │       └── buyer/+page.svelte
│   │   ├── lib/
│   │   │   ├── contracts/            (ABIs + addresses)
│   │   │   ├── stores/               (Svelte stores)
│   │   │   ├── components/           (shared UI)
│   │   │   └── utils/                (helpers)
│   │   └── app.html
│   ├── static/
│   ├── svelte.config.js
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── docs/                    ← Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SECURITY.md
│   └── DEMO_SCRIPT.md
└── README.md                ← Public-facing repo readme
```

---

## Phase Overview

| Phase | Name | Depends On | Est. Tokens | Output |
|-------|------|------------|-------------|--------|
| P0 | Scaffold | None | ~3K | Project skeleton, configs, dependencies |
| P1 | Contracts Core | P0 | ~40K | JobEscrow.sol, AgentRegistry.sol, interfaces |
| P2 | Contracts Reputation | P1 | ~30K | ReputationEngine.sol, cross-contract wiring |
| P3 | Frontend Core | P0 | ~35K | SvelteKit app, wallet connect, landing, browse agents |
| P4 | Frontend Dashboard | P3, P1 | ~35K | Agent/buyer dashboards, job creation, job detail |
| P5 | Integration | P1, P2, P3, P4 | ~25K | ABI export, contract addresses, frontend ↔ contracts |
| P6 | Testing | P1, P2, P5 | ~35K | Foundry tests, frontend tests, e2e flow |
| P7 | Deploy + Docs | All | ~20K | Base deployment, docs, README, demo script, cleanup |

**Total estimated:** ~223K tokens across 8 phases  
**Opus 4.6 context:** ~200K tokens  
**Target per phase:** ≤50% context (~100K tokens including prompt)

---

## Phase Status Tracker

| Phase | Status | Started | Completed | Notes |
|-------|--------|---------|-----------|-------|
| P0 | ✅ Complete | 2026-03-18 17:36 | 2026-03-18 17:50 | Scaffold done, forge+npm build clean |
| P1 | ✅ Complete | 2026-03-18 17:50 | 2026-03-18 17:55 | Contracts: AgentRegistry + JobEscrow, forge build clean |
| P2 | ✅ Complete | 2026-03-18 17:50 | 2026-03-18 18:00 | Frontend: components, mock data, all pages, npm build clean |
| P3 | ⏳ Pending | — | — | Integration: ABIs, real hooks, EAS |
| P4 | ⏳ Pending | — | — | Testing: Foundry tests |
| P5 | ⏳ Pending | — | — | Documentation |
| P6 | ⏳ Pending | — | — | Deploy + cleanup |
| P7 | — | — | — | Merged into P6 |

**Status key:** ⏳ Pending | 🔄 In Progress | ✅ Complete | ❌ Failed | 🔁 Redo

---

## Contract Specifications Summary

### JobEscrow.sol
- Factory pattern: each job gets its own escrow
- Statuses: Open → Assigned → InProgress → Delivered → Complete (or Disputed/Cancelled)
- Auto-release: 72h after delivery, 70% to agent, 30% pending
- Platform fee: 2.5% on successful completion
- Agent stake: 10% of job value (Tier 1+ only)

### AgentRegistry.sol
- ERC-8004 identity required for registration
- Tiers: Apprentice (0 stake, random assignment) → Proven (3+ jobs) → Expert (10+ jobs, top 25%)
- Skills array, availability toggle, acceptance rate tracking
- Max 3 active jobs per agent

### ReputationEngine.sol
- Score = Σ(job_value × buyer_wallet_score × time_decay × outcome_bonus) / total_weight
- Buyer wallet score: age >180d = 100, 30-180d = 40, <30d = 5
- Time decay: linear over 365 days
- Outcome bonus: 100 (clean), 50 (disputed)
- Component scores: technical, reliability, collaboration

---

## Frontend Specifications Summary

- **Framework:** SvelteKit 2.54 + Svelte 5.53 (TypeScript, runes syntax)
- **Styling:** TailwindCSS v4.2 (CSS-based config via @tailwindcss/vite — NO tailwind.config.js)
- **Web3:** Reown AppKit 1.8 + @reown/appkit-adapter-wagmi + viem 2.47
- **Wallet UI:** `<appkit-button />` web component (handles connect/disconnect/chain switch)
- **Contract Reads/Writes:** `@wagmi/core` vanilla JS actions (NOT React wagmi hooks)
- **Chain:** Base Mainnet (chainId: 8453)
- **Svelte Syntax:** Use `$state`, `$derived`, `$props()`, `$effect` — NOT legacy `writable()` stores
- **Component Props:** `let { prop } = $props()` NOT `export let prop`
- **SPA:** adapter-static with fallback — NO `+page.server.ts` files
- **Pages:** Landing, Browse Agents, Agent Profile, Create Job, Job Detail, Agent Dashboard, Buyer Dashboard

## Environment Requirements

- **Foundry PATH:** `export PATH="$HOME/.foundry/bin:$PATH"` (required before any forge command)
- **Foundry flags:** Use `--no-git` (NOT `--no-commit` which was removed in v1.5)
- **WalletConnect Project ID:** Obtain from https://cloud.walletconnect.com → set as `VITE_PROJECT_ID`
- **IPFS:** Use `pinata` v2.5.5 SDK

---

## Key Constants

```
PLATFORM_FEE_BPS = 250        // 2.5%
AUTO_RELEASE_DELAY = 259200   // 72 hours in seconds
AUTO_RELEASE_AGENT_PCT = 70   // 70% to agent on auto-release
DISPUTE_STAKE = 0.01 ether
MAX_ACTIVE_JOBS = 3
TIER_PROVEN_THRESHOLD = 3     // jobs to reach Tier 1
TIER_EXPERT_THRESHOLD = 10    // jobs to reach Tier 2
TIER_EXPERT_PERCENTILE = 25   // top 25%
APPRENTICE_STAKE = 0           // no stake for Tier 0
PROVEN_MIN_PRICE = 0.04 ether
EXPERT_MIN_PRICE = 0.08 ether
```

---

## Hackathon Registration

- **Participant ID:** 7a96378e-9531-4535-bebd-50bc36208db6
- **Team ID:** e371bbbe-c76e-4349-a304-6cb6329fa8d4
- **API Key:** sk-synth-f7793212feb1f001f3f15ea18ee73c93fd89475058b10404
- **Registration Tx:** https://basescan.org/tx/0x7f261f0a656f97c49df7c75aee778cc10f072a1965a96ceb6cccceb6319cc8a9

---

## Workspace Cleanup Rules

At project completion, the workspace should contain ONLY:
1. `projects/synthesis/` — the full project
2. Standard workspace files (AGENTS.md, SOUL.md, USER.md, MEMORY.md, etc.)

**To archive before cleanup:**
- Any files in `projects/synthesis/phases/` (move to `projects/synthesis/archive/phases/`)
- MANIFEST.md phase tracker should show all ✅

**To delete:**
- No temp files, no `.bak`, no duplicate configs
- Build artifacts (`node_modules/`, `cache/`, `out/`) stay in `.gitignore`

---

## Recovery Protocol

**If context is wiped mid-build:**

1. Read `projects/synthesis/MANIFEST.md` (this file)
2. Check Phase Status Tracker above
3. Find the last ✅ phase
4. Read the NEXT phase's prompt from `projects/synthesis/phases/P{N}-*.md`
5. Execute that phase
6. Update this MANIFEST when done

**If files are corrupted:**
1. Check git history: `cd projects/synthesis && git log --oneline -10`
2. Restore from last commit
3. Re-run failed phase

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-11 | Marketplace > Pure Reputation | Reputation from transactions is self-validating; marketplace has investor appeal |
| 2026-03-11 | Foundry > Hardhat | Faster tests, better Solidity-native tooling |
| 2026-03-11 | SvelteKit > Next.js | Lighter, faster, team familiarity |
| 2026-03-11 | Base > other L2s | Hackathon uses Base for ERC-8004; no bridge needed |
| 2026-03-11 | Per-job escrow > Pooled | Limits blast radius of exploits |
| 2026-03-11 | No token at launch | Focus on product, avoid regulatory distraction |
| 2026-03-12 | Multi-phase AI build | Context window management; each phase ≤50% of 200K |
| 2026-03-12 | 8 phase prompts complete | P0-P7 all written, reviewed, cross-referenced |
| 2026-03-12 | Red team audit v2 | Verified all deps against live docs |
| 2026-03-12 | wagmi → Reown AppKit | wagmi is React-only; Reown has official Svelte support |
| 2026-03-12 | TailwindCSS v3 → v4 | v4 is current default; uses CSS config, not JS |
| 2026-03-12 | Svelte stores → runes | Svelte 5 prefers $state/$props(); stores are legacy |
| 2026-03-12 | Foundry --no-commit → --no-git | Flag renamed in Foundry v1.5.1 |
| 2026-03-12 | Wallet age → Platform tenure | Can't determine true wallet age on-chain; use firstInteraction mapping |
| 2026-03-12 | Per-job contract → Mapping-based factory | Single contract with mappings; true per-job deploy too expensive for demo |
| 2026-03-18 | ReputationEngine → EAS attestations | Eliminates ~500 lines custom code; uses battle-tested protocol already on Base |
| 2026-03-18 | Remove Safe dependency | Mapping-based factory doesn't need Safe wallets |
| 2026-03-18 | Add shadcn-svelte | Production-quality accessible components, less custom UI code |
| 2026-03-18 | 8 phases → 6 phases | Merged P1+P2 (no ReputationEngine), tighter execution |
| 2026-03-18 | ReentrancyGuard → ReentrancyGuardTransient | OZ v5.6, EIP-1153 transient storage, ~10K less gas |
| 2026-03-18 | EXECUTION_PROMPT.md created | Full autonomous build prompt for zero-to-production |

---

**End of MANIFEST**
