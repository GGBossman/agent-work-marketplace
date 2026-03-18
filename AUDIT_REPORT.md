# Code Audit Report — Agent Work Marketplace
**Date:** 2026-03-18  
**Auditor:** Codex (claude-opus-4-6)  
**Scope:** Full codebase (contracts + frontend + docs + submission)

---

## Executive Summary

The project has solid foundations — clean Solidity, 41 passing tests, deployed contracts. However, **the frontend runs entirely on mock data** (`USE_MOCK = true`), which means judges connecting wallets will see zero on-chain interaction. This is the #1 blocker for winning.

**Critical issues: 4 | High: 5 | Medium: 6 | Low: 4**

---

## CRITICAL (Must Fix Before Submission)

### C-1: Frontend USE_MOCK = true (Frontend)
**File:** `frontend/src/lib/contracts/hooks.ts:10`  
**Impact:** The entire frontend is a glorified mockup. No contract reads/writes happen. Judges will not see any on-chain functionality.  
**Fix:** Set `USE_MOCK = false`. But this exposes C-2, C-3, and C-4 below.

### C-2: acceptJobOnChain Missing Stake Value (Frontend)  
**File:** `frontend/src/lib/contracts/hooks.ts` — `acceptJobOnChain()`  
**Impact:** Agent acceptance will revert on-chain because no ETH is sent for the 10% stake requirement.  
**Fix:** Calculate `requiredStake = escrowAmount * 1000 / 10000` and pass as `value` in writeContract call.

### C-3: Event Signature Placeholder (Frontend)
**File:** `frontend/src/lib/contracts/hooks.ts:185`  
**Code:** `log.topics[0] === '0x...'` — literal placeholder, never matches anything.  
**Fix:** Compute actual `JobCreated` event signature or parse logs properly using viem's `decodeEventLog`.

### C-4: No Event-Based Job/Agent Listing (Frontend)
**File:** `frontend/src/lib/contracts/hooks.ts` — `fetchAgents()`, `fetchJobs()`  
**Impact:** Even with USE_MOCK=false, these functions return mock data. No way to browse on-chain agents/jobs.  
**Fix:** Use viem `getContractEvents` / `getLogs` to query `AgentRegistered` and `JobCreated` events, then `readContract` for current state.

---

## HIGH (Should Fix)

### H-1: Auto-Release Partial Zeroes Stake (Contract)
**File:** `contracts/src/JobEscrow.sol:139-140`  
**Impact:** After 72h partial release, `stakeAmount` is set to 0. At 96h full release, `agentPayout + job.stakeAmount` sends `agentPayout + 0`. Agent permanently loses their 10% stake.  
**Fix:** Don't zero the stake on partial release, or track partial release state separately.

### H-2: Auto-Release Double-Call Vulnerability (Contract)
**File:** `contracts/src/JobEscrow.sol:120-148`  
**Impact:** After partial release, job status stays `Delivered`. Anyone can call `initiateAutoRelease` again at 96h+. The full release executes on the *reduced* `escrowAmount` (30% of original), taking a platform fee on that. Math is distorted.  
**Fix:** Track partial release state. On full release, compute based on original amount or track released amounts.

### H-3: Dispute Stake Goes to Contract, Never Returns (Contract)
**File:** `contracts/src/JobEscrow.sol:155-162`  
**Impact:** 0.01 ETH dispute stake is accepted but never tracked per-dispute and has no refund path. Funds are permanently locked.  
**Fix:** Add dispute stake tracking and a dispute resolution path, or remove dispute stake requirement.

### H-4: No Deadline Enforcement (Contract)
**File:** `contracts/src/JobEscrow.sol`  
**Impact:** Agent can submit deliverables after deadline passes. Buyer has no recourse for late delivery.  
**Fix:** Add `require(block.timestamp <= job.deadline)` to `submitDeliverable`, or add buyer cancel rights post-deadline.

### H-5: Minimum Price Constants Unused (Contract)
**File:** `contracts/src/libraries/Constants.sol:27-30`  
**Impact:** `PROVEN_MIN_PRICE` and `EXPERT_MIN_PRICE` are defined but never enforced in `createJob` or `assignAgent`. Tier-based pricing is aspirational, not functional.  
**Fix:** Enforce in `assignAgent` based on agent tier.

---

## MEDIUM

### M-1: No `resolveDispute` Function
Disputes permanently lock funds. Acknowledged as post-hackathon, but should be mentioned in docs.

### M-2: `fileDispute` Has No Time Limit
Can file dispute on delivered job indefinitely, even after auto-release has partially executed.

### M-3: Missing `stakeForTier` Zero-Value Check  
Actually present — `require(msg.value > 0)`. ✅ False alarm.

### M-4: No Agent Deregistration
Once registered, agents cannot deregister or change their ERC-8004 identity.

### M-5: Treasury Single Point of Trust
Owner can change treasury address at any time. Active jobs aren't protected.

### M-6: Frontend appkit.ts May Lack Error Handling
Need to verify wallet connection errors are properly caught.

---

## LOW

### L-1: Block.timestamp Dependence
Miners can manipulate ±15s. Negligible for day-scale deadlines.

### L-2: No Event for Agent Metadata Update  
No `updateMetadata` function exists at all.

### L-3: No Upgradeability Pattern
Immutable contracts. Acceptable for hackathon.

### L-4: Job ID Collision (Theoretical)
`keccak256(sender, nonce++, timestamp)` — effectively impossible due to nonce.

---

## UAT Test Plan

### Test Scenario 1: Full Job Lifecycle (Happy Path)
1. Connect Buyer wallet → Create job (0.05 ETH, 7 day deadline)
2. Connect Agent wallet → Register agent → Set available
3. Buyer assigns agent
4. Agent accepts (stakes 10%)
5. Agent submits deliverable URI
6. Buyer confirms delivery
7. Verify: Agent receives 97.5% + stake, Treasury receives 2.5%
8. Verify: Agent completedJobs incremented

### Test Scenario 2: Auto-Release (72h + 96h)
1. Create job → Assign → Accept → Submit deliverable
2. Warp 72h+ → Call initiateAutoRelease → Verify 70% released
3. Warp 96h+ → Call initiateAutoRelease → Verify full release + Complete status

### Test Scenario 3: Cancellation
1. Create job → Cancel immediately (Open state) → Verify refund
2. Create job → Assign → Cancel (Assigned state) → Verify refund + activeJobs decremented
3. Create job → Assign → Accept → Attempt cancel → Should revert

### Test Scenario 4: Dispute Filing
1. Create → Assign → Accept → Submit → File dispute → Verify status change
2. Attempt dispute with insufficient stake → Should revert

### Test Scenario 5: Agent Tier Promotion
1. Register agent → Complete 3 jobs → Verify Proven tier
2. Complete 7 more → Verify Expert tier

### Test Scenario 6: Max Active Jobs
1. Register agent → Assign 3 jobs → Attempt 4th → Should revert

### Test Scenario 7: Edge Cases
1. Zero-value job creation → Should revert
2. Past deadline job → Should revert
3. Empty description → Should revert
4. Assign unregistered agent → Should revert
5. Assign unavailable agent → Should revert
6. Double registration → Should revert
7. Identity collision → Should revert

---

## Submission Checklist

- [ ] Frontend connected to real contracts (USE_MOCK = false)
- [ ] Full job lifecycle works end-to-end on Base Sepolia
- [ ] GitHub repo updated and pushed
- [ ] GitHub Pages deployed with working frontend
- [ ] Devfolio project metadata updated
- [ ] Demo video recorded (5 min, show full lifecycle)
- [ ] README has all links, addresses, and instructions
- [ ] ⚠️ GitHub token (ghp_6DH7...) revoked
- [ ] SECURITY.md updated with audit findings

---

## Priority Execution Order

1. **Fix contracts** (H-1, H-2, H-4, H-5) → Re-run tests → Redeploy
2. **Fix frontend** (C-1, C-2, C-3, C-4) → Build → Deploy to GH Pages
3. **UAT loop** — Run all 7 test scenarios on deployed contracts
4. **Update docs** — SECURITY.md, README, SUBMISSION.md
5. **Update Devfolio** — Ensure project metadata is current
6. **Demo video** — Record 5-min walkthrough

**End of Audit**
