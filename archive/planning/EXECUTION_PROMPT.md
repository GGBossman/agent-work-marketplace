# EXECUTION PROMPT — Autonomous Build
## Agent Work Marketplace

**Target:** Build complete, production-ready project from zero code to deployed dApp.  
**Constraint:** Max 3 concurrent subagents. No placeholders. Every file must contain real, working code.  
**Model:** claude-opus-4-6 (main orchestrator), venice/zai-org-glm-5 (subagents)

---

## BOOT SEQUENCE

When this prompt is received, execute the following in order:

### Step 0: Orient

```
1. Read projects/synthesis/MANIFEST.md — check Phase Status Tracker
2. Read projects/synthesis/PRD.md — understand the product
3. Run: find projects/synthesis/ -name "*.sol" -o -name "*.ts" -o -name "*.svelte" | wc -l
4. If code files exist → find the last completed phase and resume from next
5. If zero code files → start from Phase 0
```

### Step 1: Environment Check

```bash
export PATH="$HOME/.foundry/bin:$PATH"
forge --version    # Must show v1.5+
node --version     # Must show v22+
npm --version      # Must show v10+
```

If any tool is missing, report and stop.

---

## ARCHITECTURE (Updated with Simplifications)

### Key Changes from Original Plan

| Original | Updated | Rationale |
|----------|---------|-----------|
| Custom ReputationEngine.sol | EAS attestations on Base | Battle-tested, already deployed, browsable at base.easscan.org |
| Safe (Gnosis) escrow backend | Simple OZ ReentrancyGuardTransient | Mapping-based factory doesn't need Safe |
| Custom Toast/Tab/Form components | shadcn-svelte + bits-ui | Production-quality accessible components |
| 8 phases | 6 phases | Merged P1+P2 (no ReputationEngine), tighter execution |
| writable() stores | Svelte 5 $state runes | Modern, recommended by Svelte docs |
| wagmi React hooks | @wagmi/core + Reown AppKit | wagmi is React-only; AppKit has Svelte support |
| TailwindCSS v3 config | TailwindCSS v4 @theme CSS | v4 is current default |

### Contract Architecture (Simplified)

```
contracts/src/
├── JobEscrow.sol          — Escrow factory with job mappings
├── AgentRegistry.sol      — Agent profiles, tiers, staking
├── interfaces/
│   ├── IJobEscrow.sol
│   └── IAgentRegistry.sol
└── libraries/
    └── Constants.sol      — Shared constants
```

**Removed:** ReputationEngine.sol, IReputationEngine.sol, Types.sol  
**Added:** EAS attestation calls in JobEscrow.sol completion flow

### Frontend Architecture

```
frontend/src/
├── routes/
│   ├── +page.svelte              (landing)
│   ├── +layout.svelte            (nav + AppKit)
│   ├── agents/+page.svelte       (browse)
│   ├── agents/[address]/+page.svelte (profile)
│   ├── jobs/+page.svelte         (list)
│   ├── jobs/new/+page.svelte     (create)
│   ├── jobs/[id]/+page.svelte    (detail)
│   └── dashboard/+page.svelte    (unified)
├── lib/
│   ├── appkit.ts                 (Reown wallet config)
│   ├── contracts/
│   │   ├── abis.ts               (exported ABIs)
│   │   ├── addresses.ts          (deployed addresses)
│   │   └── hooks.ts              (read/write actions)
│   ├── stores/
│   │   ├── wallet.svelte.ts      ($state runes)
│   │   └── notifications.svelte.ts
│   ├── components/
│   │   ├── AgentCard.svelte
│   │   ├── JobCard.svelte
│   │   ├── TierBadge.svelte
│   │   ├── StatusBadge.svelte
│   │   └── TxToast.svelte
│   ├── types.ts
│   └── utils/
│       ├── format.ts
│       └── eas.ts                (EAS SDK helpers)
└── app.css                       (TW v4 @theme)
```

---

## EXECUTION PHASES

### Phase 0: Scaffold (Orchestrator does this directly — no subagent)

**Time estimate:** 10 minutes  
**Output:** Compiling Foundry project + building SvelteKit app

```
Actions:
1. export PATH="$HOME/.foundry/bin:$PATH"
2. cd projects/synthesis && mkdir -p contracts frontend docs
3. Initialize Foundry:
   cd contracts && forge init --no-git
4. Configure foundry.toml (solc 0.8.24, optimizer, Base RPC)
5. Install OZ: forge install OpenZeppelin/openzeppelin-contracts --no-git
6. Create contract stubs (IJobEscrow.sol, IAgentRegistry.sol, JobEscrow.sol, AgentRegistry.sol, Constants.sol)
7. forge build — must pass
8. Initialize SvelteKit:
   cd ../frontend && npx sv create . --template minimal --types ts --no-add-ons --no-install
9. npm install
10. npm install @reown/appkit @reown/appkit-adapter-wagmi wagmi viem
11. npm install tailwindcss @tailwindcss/vite
12. npm install -D @sveltejs/adapter-static
13. npm install shadcn-svelte bits-ui
14. npm install @ethereum-attestation-service/eas-sdk
15. npm install pinata
16. Configure vite.config.ts (@tailwindcss/vite + sveltekit)
17. Configure app.css (@import "tailwindcss" + @theme block)
18. Configure svelte.config.js (adapter-static)
19. Create appkit.ts (Reown config for Base)
20. Create types.ts, addresses.ts, abis.ts (real types, empty ABIs)
21. Create .env.example
22. npm run build — must pass
23. git init && git add -A && git commit -m "P0: scaffold"
24. Update MANIFEST.md: P0 → ✅
```

**Verify:** `forge build` exits 0 AND `npm run build` exits 0.

---

### Phase 1: Smart Contracts (Subagent A)

**Spawn as:** `sessions_spawn` with model `venice/zai-org-glm-5`  
**Time estimate:** 30-60 minutes  
**Depends on:** P0 ✅  

**Task for subagent:**
```
You are building the smart contracts for Agent Work Marketplace.

ENVIRONMENT:
- export PATH="$HOME/.foundry/bin:$PATH"  
- Working directory: projects/synthesis/contracts/
- Solidity 0.8.24, Foundry v1.5.1
- OpenZeppelin v5.6.1 already installed

READ FIRST:
- projects/synthesis/MANIFEST.md
- projects/synthesis/PRD.md (sections 5.2, 7)
- projects/synthesis/phases/P1-CONTRACTS-CORE.md

BUILD these files with COMPLETE implementation (no placeholders, no TODOs):

1. src/libraries/Constants.sol
   - All platform constants (fees, delays, thresholds)

2. src/interfaces/IJobEscrow.sol
   - Full interface with events, structs, enums, function signatures
   - JobStatus enum: Open, Assigned, InProgress, Delivered, Disputed, Complete, Cancelled
   - Job struct with all fields
   - All events: JobCreated, JobAssigned, AgentAccepted, DeliverableSubmitted, DeliveryConfirmed, AutoReleaseTriggered, DisputeFiled, JobCancelled

3. src/interfaces/IAgentRegistry.sol
   - Full interface with events, structs, function signatures
   - AgentTier enum: Apprentice, Proven, Expert
   - AgentProfile struct
   - All events: AgentRegistered, AvailabilityChanged, TierPromoted, StakeDeposited, StakeWithdrawn

4. src/JobEscrow.sol
   - Inherits: IJobEscrow, ReentrancyGuardTransient, Ownable
   - Factory pattern with mapping(bytes32 => Job)
   - createJob() — buyer sends ETH, job created
   - assignAgent() — buyer assigns registered agent
   - agentAccept() — agent accepts with 10% stake (Tier 1+ only)
   - submitDeliverable() — agent submits IPFS URI
   - confirmDelivery() — buyer confirms, 97.5% to agent, 2.5% to treasury, stake returned
   - initiateAutoRelease() — anyone calls after 72h: 70% released; after 96h: remaining 30%
   - fileDispute() — requires 0.01 ETH stake
   - cancelJob() — buyer cancels if Open/Assigned
   - Full NatSpec comments
   - All require checks, input validation
   - Platform fee to treasury address
   - Max 3 active jobs per agent (enforced)
   - Calls agentRegistry.recordJobCompletion() on confirm
   - EAS attestation on job completion (call EAS contract at 0x4200000000000000000000000000000000000021)

5. src/AgentRegistry.sol
   - Inherits: IAgentRegistry, Ownable
   - registerAgent() — requires ERC-8004 identity bytes32
   - updateAvailability()
   - stakeForTier() / unstake()
   - recordJobCompletion() — only callable by JobEscrow, updates stats
   - Auto-promotion: 3 jobs → Proven, 10 jobs + criteria → Expert
   - getEligibleAgents() view
   - getAgentProfile() view
   - Full NatSpec comments

6. script/Deploy.s.sol
   - Deploys AgentRegistry, then JobEscrow(registry, treasury)
   - Wires cross-contract references
   - Registers EAS schema for job completions
   - Logs all addresses

AFTER WRITING ALL FILES:
- Run: forge build
- If errors: fix them
- Run: forge build again until clean
- Report: list of files created, any issues found and fixed

DO NOT create test files — those come in Phase 5.
```

---

### Phase 2: Frontend Core + Pages (Subagent B — runs PARALLEL with Phase 1)

**Spawn as:** `sessions_spawn` with model `venice/zai-org-glm-5`  
**Time estimate:** 30-60 minutes  
**Depends on:** P0 ✅  

**Task for subagent:**
```
You are building the complete frontend for Agent Work Marketplace.

ENVIRONMENT:
- Working directory: projects/synthesis/frontend/
- SvelteKit 5 + Svelte 5 (runes syntax)
- TailwindCSS v4 (@tailwindcss/vite, CSS config)
- Reown AppKit for wallet

CRITICAL RULES:
- Use Svelte 5 runes: $state, $derived, $props(), $effect
- Component props: let { prop } = $props() — NOT export let prop
- Layout: {@render children()} — NOT <slot />
- NO writable() stores — use .svelte.ts files with $state
- NO tailwind.config.js — TW v4 uses @theme in CSS
- NO +page.server.ts — SPA mode with adapter-static
- ALL code must be real and functional — no placeholders, no TODOs

READ FIRST:
- projects/synthesis/MANIFEST.md
- projects/synthesis/PRD.md (sections 4, 6)
- projects/synthesis/phases/P3-FRONTEND-CORE.md
- projects/synthesis/phases/P4-FRONTEND-DASHBOARD.md

BUILD ALL of these files with COMPLETE implementation:

1. src/app.css — TW v4 @import + @theme with custom colors (primary, surface, dark, apprentice, proven, expert)

2. src/lib/appkit.ts — Reown AppKit config for Base chain with browser check

3. src/lib/types.ts — All TypeScript interfaces (Agent, Job, AgentTier, JobStatus, ReputationScore, Notification)

4. src/lib/stores/wallet.svelte.ts — Reactive wallet state using $state runes

5. src/lib/stores/notifications.svelte.ts — Notification state with notify()/dismiss()

6. src/lib/components/TierBadge.svelte — Tier badge with color per tier
7. src/lib/components/StatusBadge.svelte — Status badge with color per status
8. src/lib/components/AgentCard.svelte — Agent card with reputation bar, skills, availability
9. src/lib/components/JobCard.svelte — Job card with budget, status, deadline
10. src/lib/components/TxToast.svelte — Transaction toast (pending/confirmed/failed with BaseScan link)

11. src/lib/contracts/hooks.ts — Contract interaction functions with MOCK DATA for now:
    - fetchAgents(), fetchAgent(), fetchJobs(), fetchJob()
    - createJob(), acceptJob(), submitDeliverable(), confirmDelivery(), cancelJob()
    - registerAgent()
    - Use 5 realistic mock agents (all tiers) and 8 mock jobs (all statuses)

12. src/lib/utils/format.ts — Address truncation, ETH formatting, date formatting

13. src/routes/+layout.svelte — Full layout with nav, AppKit button, footer
14. src/routes/+page.svelte — Landing page with hero, features, stats
15. src/routes/agents/+page.svelte — Agent browse with search, tier filter, availability toggle, grid
16. src/routes/agents/[address]/+page.svelte — Agent profile with reputation, skills, job history
17. src/routes/jobs/+page.svelte — Job list with status filter tabs
18. src/routes/jobs/new/+page.svelte — Job creation form (task type, budget, deadline, description) with validation
19. src/routes/jobs/[id]/+page.svelte — Job detail with status-dependent UI (different views per status)
20. src/routes/dashboard/+page.svelte — Unified dashboard with buyer/agent tabs, stats, active/completed jobs

21. svelte.config.js — adapter-static with SPA fallback
22. vite.config.ts — @tailwindcss/vite + sveltekit plugins

AFTER WRITING ALL FILES:
- Run: npm run build
- If errors: fix them (type errors, import errors, syntax)
- Run: npm run build again until clean
- Report: list of files created, any issues found and fixed
```

---

### CHECKPOINT 1: Code Review (Orchestrator)

After Phase 1 + Phase 2 subagents complete:

```
1. Read all .sol files in contracts/src/ — verify:
   - No placeholder comments, no TODOs
   - All functions have full implementations
   - NatSpec on all public functions
   - ReentrancyGuardTransient used (not ReentrancyGuard)
   - EAS attestation call present in confirmDelivery
   - forge build passes

2. Read all .svelte and .ts files in frontend/src/ — verify:
   - $props() syntax (not export let)
   - {@render children()} (not <slot />)
   - $state runes (not writable())
   - No +page.server.ts files
   - npm run build passes

3. Fix any issues found
4. git add -A && git commit -m "P1+P2: contracts + frontend core"
5. Update MANIFEST.md: P1 → ✅, P2 → ✅ (mapped to new phase numbers)
```

---

### Phase 3: Integration (Subagent C)

**Spawn as:** `sessions_spawn` with model `venice/zai-org-glm-5`  
**Time estimate:** 20-40 minutes  
**Depends on:** P1 ✅ AND P2 ✅  

**Task for subagent:**
```
You are wiring smart contracts to the SvelteKit frontend for Agent Work Marketplace.

ENVIRONMENT:
- export PATH="$HOME/.foundry/bin:$PATH"
- Contracts compiled in: projects/synthesis/contracts/out/
- Frontend in: projects/synthesis/frontend/

CRITICAL: Use @wagmi/core vanilla JS actions — NOT wagmi React hooks.

READ FIRST:
- projects/synthesis/MANIFEST.md
- All .sol files in contracts/src/
- frontend/src/lib/contracts/hooks.ts (current mock version)

BUILD:

1. Extract ABIs from Foundry output:
   - Read contracts/out/JobEscrow.sol/JobEscrow.json → extract .abi
   - Read contracts/out/AgentRegistry.sol/AgentRegistry.json → extract .abi
   - Write to frontend/src/lib/contracts/abis.ts (real ABIs, typed as const)

2. Update frontend/src/lib/contracts/addresses.ts:
   - Add Base Sepolia placeholder addresses (will be updated after deploy)
   - Add Base Mainnet placeholder addresses
   - Chain-based address switching function

3. REPLACE frontend/src/lib/contracts/hooks.ts with REAL contract calls:
   - Import { readContract, writeContract, waitForTransactionReceipt } from @wagmi/core
   - Import { getAccount } from @wagmi/core
   - Import ABIs and addresses
   - Every mock function → real contract interaction
   - Keep mock data as FALLBACK when contract calls fail (for demo without deploy)
   - Add error handling with user-friendly messages

4. Create frontend/src/lib/utils/eas.ts:
   - Import EAS SDK
   - getReputationFromEAS(agentAddress) — query attestations
   - createJobCompletionAttestation() — for contract integration

5. Create frontend/src/lib/contracts/events.ts:
   - Event listeners for JobCreated, JobAssigned, PaymentReleased using @wagmi/core watchContractEvent

6. Update all route pages to use real hooks instead of mock (but gracefully fall back)

7. Create frontend/.env.example with all required vars

AFTER:
- Run: npm run build (must pass)
- Report files created/modified
```

---

### CHECKPOINT 2: Integration Review (Orchestrator)

```
1. Verify ABIs match contract interfaces
2. Verify all hooks use @wagmi/core (not wagmi React)
3. Verify fallback to mock data works
4. npm run build passes
5. forge build still passes
6. git commit -m "P3: integration wired"
7. Update MANIFEST.md
```

---

### Phase 4: Testing (Orchestrator does this directly — needs careful debugging)

**Time estimate:** 45-90 minutes  
**Depends on:** P1 ✅, P3 ✅  

The orchestrator writes and runs tests directly because:
- Tests require iterative debugging (run → fail → fix → repeat)
- Subagents can't easily iterate on forge test output
- Quality matters most here

```
Actions:
1. export PATH="$HOME/.foundry/bin:$PATH"
2. Create test/helpers/TestSetup.sol — base contract with deploy + helpers
3. Create test/JobEscrow.t.sol — ALL test categories:
   - Job creation (success + revert cases)
   - Agent assignment (success + revert)
   - Agent acceptance with stake
   - Deliverable submission
   - Delivery confirmation (fee math, stake return)
   - Auto-release (72h, 96h, early revert)
   - Job cancellation
   - Reentrancy protection
4. Create test/AgentRegistry.t.sol:
   - Registration
   - Availability toggle
   - Staking
   - Tier promotion
   - Access control
5. Create test/Integration.t.sol:
   - Full job lifecycle end-to-end
   - Multiple jobs → tier promotion
   - Max active jobs enforcement
6. Run: forge test -vvv
7. FOR EACH FAILURE:
   - Read error
   - Fix contract OR test
   - Re-run
   - Document fix
8. Run: forge test --gas-report > docs/gas-report.txt
9. Verify: All tests green, no function > 300K gas
10. git commit -m "P4: tests passing"
11. Update MANIFEST.md
```

---

### Phase 5: Documentation (Orchestrator writes directly)

```
1. Create docs/ARCHITECTURE.md — system diagram, contract interactions, EAS flow
2. Create docs/API.md — all public contract functions with params, returns, events, example cast calls
3. Create docs/SECURITY.md — methodology, findings, mitigations, known limitations
4. Create docs/DEMO.md — 5-minute demo script with exact steps
5. Create README.md — public-facing with features, architecture, quick start, contract addresses
6. Update PRD.md conversation log
7. git commit -m "P5: documentation complete"
```

---

### Phase 6: Deploy + Cleanup (Orchestrator)

```
1. Deploy to Base Sepolia:
   forge script script/Deploy.s.sol:Deploy --rpc-url https://sepolia.base.org --broadcast -vvv
2. Record contract addresses
3. Update frontend/src/lib/contracts/addresses.ts with real addresses
4. Deploy frontend: npm run build
5. Final npm run build verification
6. Archive phase prompts: mv phases/ archive/phases/
7. Clean workspace (remove temp files)
8. git add -A && git commit -m "P6: deployed and documented"
9. Update MANIFEST.md: all phases ✅
10. Create maintenance cron (see below)
```

---

## MAINTENANCE CRON

After build completion, create a cron job to monitor the deployed contracts:

```
Schedule: Every 6 hours
Task: Check contract health
- Verify contracts respond on Base Sepolia
- Check if any jobs are stuck in Delivered status > 72h (auto-release candidates)
- Report any anomalies to #codex-lab
```

---

## SUBAGENT RULES

1. **Max 3 concurrent subagents** — never spawn more
2. **Model:** All subagents MUST use `venice/zai-org-glm-5` — NEVER inherit Opus
3. **Timeout:** 10 minutes per subagent (kill and retry if exceeded)
4. **File handoff:** Subagents write code to files. Orchestrator reviews after.
5. **No placeholders:** If a subagent writes TODOs or placeholder comments, the orchestrator must fix them before proceeding.

---

## ERROR RECOVERY

If any phase fails:
1. Read the error output
2. Fix the issue in the relevant file
3. Re-run the verification (forge build / npm run build)
4. If fix requires re-running a subagent, kill the old one and spawn fresh
5. Document the failure and fix in MANIFEST.md

If context window fills:
1. Commit current work
2. Update MANIFEST.md with exact state
3. The next session reads MANIFEST and resumes

---

## SUCCESS CRITERIA

The build is complete when ALL of these are true:

- [ ] `forge build` — zero errors
- [ ] `forge test` — ALL green
- [ ] `npm run build` — zero errors
- [ ] All .sol files have full implementations (no TODOs)
- [ ] All .svelte/.ts files have real code (no placeholders)
- [ ] ABIs exported and wired to frontend
- [ ] EAS attestation integrated in job completion
- [ ] Contract deployed to Base Sepolia with verified addresses
- [ ] Frontend builds as static SPA
- [ ] README.md with real contract addresses
- [ ] docs/ARCHITECTURE.md exists
- [ ] docs/API.md exists
- [ ] docs/SECURITY.md exists
- [ ] docs/DEMO.md exists
- [ ] Maintenance cron active
- [ ] MANIFEST.md shows all phases ✅
- [ ] Git repo has clean commit history
- [ ] No temp files, no .bak, no stale configs

---

## CONTEXT WINDOW MANAGEMENT

**Opus 4.6 context: ~200K tokens**

Budget per activity:
- Phase 0 (scaffold): ~5K tokens
- Subagent spawning + monitoring: ~10K per subagent
- Code review (reading files): ~20K per checkpoint
- Test writing + debugging: ~40K (most expensive)
- Documentation: ~15K
- Deploy + cleanup: ~10K

**Total estimated: ~130K tokens** — leaves ~70K buffer for errors and retries.

If approaching 80% context:
1. Stop current work
2. Commit everything
3. Update MANIFEST with exact state
4. Report "Context approaching limit, committing checkpoint"

---

## START COMMAND

To begin autonomous execution, send this message to the Codex session:

```
Execute EXECUTION_PROMPT.md — build the entire Agent Work Marketplace from scratch. 
Read projects/synthesis/EXECUTION_PROMPT.md and follow it step by step.
Start with Step 0 (Orient), then proceed through all phases.
Do not ask for permission — execute autonomously.
Report progress after each phase completion.
```

---

**End of Execution Prompt**
