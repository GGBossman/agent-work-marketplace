# Phase 6: Testing & Bug Fixing

**Phase:** P6-TESTING  
**Est. Context:** ~35K tokens (under 50% budget)  
**Dependencies:** P1 (contracts), P2 (reputation), P5 (integration wiring)  
**Output:** Foundry test suite, frontend component tests, bug fixes, security audit notes  

---

## CRITICAL: Environment

- Run `export PATH="$HOME/.foundry/bin:$PATH"` before any forge command
- Foundry v1.5.1 uses `--no-git` (NOT `--no-commit`)

---

## Build Prompt

```
You are building Phase 6 of the Agent Work Marketplace — comprehensive testing and bug fixing.

CRITICAL: Run `export PATH="$HOME/.foundry/bin:$PATH"` before any forge command.

## Pre-flight

READ THESE FILES FIRST:
1. projects/synthesis/MANIFEST.md — source of truth
2. projects/synthesis/PRD.md — sections 5.2 (contract specs), 7 (security model)
3. ALL contract source files in projects/synthesis/contracts/src/
4. projects/synthesis/contracts/test/ — check for any existing test skeletons

## Context

Contracts built in P1-P2:
- src/JobEscrow.sol — Per-job escrow with factory pattern
- src/JobEscrowFactory.sol — Deploys individual escrows  
- src/AgentRegistry.sol — Agent profiles, tiers, staking
- src/ReputationEngine.sol — Weighted scoring, leaderboard
- src/interfaces/ — IJobEscrow, IAgentRegistry, IReputationEngine
- src/libraries/Types.sol — Shared types

Key constants (from MANIFEST.md):
- PLATFORM_FEE_BPS = 250 (2.5%)
- AUTO_RELEASE_DELAY = 259200 (72h)
- AUTO_RELEASE_AGENT_PCT = 70
- DISPUTE_STAKE = 0.01 ether
- MAX_ACTIVE_JOBS = 3
- TIER_PROVEN_THRESHOLD = 3
- TIER_EXPERT_THRESHOLD = 10

## Build Order

### 1. Test Helpers (test/helpers/TestSetup.sol)

Create base test contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/JobEscrow.sol";
import "../src/JobEscrowFactory.sol";
import "../src/AgentRegistry.sol";
import "../src/ReputationEngine.sol";

abstract contract TestSetup is Test {
    JobEscrowFactory public factory;
    AgentRegistry public registry;
    ReputationEngine public reputation;
    
    address public owner = makeAddr("owner");
    address public treasury = makeAddr("treasury");
    address public buyer1 = makeAddr("buyer1");
    address public buyer2 = makeAddr("buyer2");
    address public agent1 = makeAddr("agent1");
    address public agent2 = makeAddr("agent2");
    address public agent3 = makeAddr("agent3");
    address public attacker = makeAddr("attacker");
    
    bytes32 public constant TASK_CODE_REVIEW = keccak256("code_review");
    bytes32 public constant TASK_TEST_GEN = keccak256("test_gen");
    bytes32 public constant TASK_DOCS = keccak256("docs");
    
    function setUp() public virtual {
        vm.startPrank(owner);
        
        // Deploy contracts
        registry = new AgentRegistry();
        reputation = new ReputationEngine();
        factory = new JobEscrowFactory(address(registry), address(reputation), treasury);
        
        // Wire contracts
        registry.setJobEscrow(address(factory));
        registry.setReputationEngine(address(reputation));
        reputation.setJobEscrow(address(factory));
        
        vm.stopPrank();
        
        // Fund test accounts
        vm.deal(buyer1, 10 ether);
        vm.deal(buyer2, 10 ether);
        vm.deal(agent1, 1 ether);
        vm.deal(agent2, 1 ether);
        vm.deal(agent3, 1 ether);
        vm.deal(attacker, 10 ether);
    }
    
    // Helper: Register an agent
    function _registerAgent(address agent, bytes32 identity, bytes32[] memory skills) internal {
        vm.prank(agent);
        registry.registerAgent(identity, "ipfs://metadata", skills);
    }
    
    // Helper: Create a job and return jobId
    function _createJob(address buyer, uint256 budget) internal returns (bytes32) {
        vm.prank(buyer);
        return factory.createJob{value: budget}(TASK_CODE_REVIEW, block.timestamp + 1 days);
    }
    
    // Helper: Full job lifecycle (create → assign → accept → deliver → confirm)
    function _completeJob(address buyer, address agent, uint256 budget) internal returns (bytes32) {
        bytes32 jobId = _createJob(buyer, budget);
        
        vm.prank(buyer);
        factory.assignAgent(jobId, agent);
        
        uint256 stake = budget / 10; // 10%
        vm.prank(agent);
        factory.agentAccept{value: stake}(jobId);
        
        vm.prank(agent);
        factory.submitDeliverable(jobId, "ipfs://deliverable");
        
        vm.prank(buyer);
        factory.confirmDelivery(jobId);
        
        return jobId;
    }
}
```

### 2. JobEscrow Tests (test/JobEscrow.t.sol)

```
Test categories:

A. JOB CREATION
- test_createJob_success: buyer creates job with ETH, emits JobCreated
- test_createJob_zeroValue_reverts: must send ETH
- test_createJob_pastDeadline_reverts: deadline must be future
- test_createJob_emitsCorrectEvent: verify all event fields

B. AGENT ASSIGNMENT
- test_assignAgent_success: buyer assigns registered agent
- test_assignAgent_notBuyer_reverts: only buyer can assign
- test_assignAgent_unregistered_reverts: agent must be in registry
- test_assignAgent_unavailable_reverts: agent must be available
- test_assignAgent_maxJobs_reverts: agent already has 3 active jobs

C. AGENT ACCEPTANCE
- test_agentAccept_success: agent accepts with correct stake
- test_agentAccept_wrongStake_reverts: must be exactly 10% of escrow
- test_agentAccept_notAssigned_reverts: only assigned agent can accept
- test_agentAccept_statusChange: status goes from Assigned → InProgress

D. DELIVERABLE SUBMISSION
- test_submitDeliverable_success: agent submits URI, status → Delivered
- test_submitDeliverable_notAgent_reverts: only assigned agent
- test_submitDeliverable_wrongStatus_reverts: must be InProgress
- test_submitDeliverable_emptyURI_reverts: URI cannot be empty

E. DELIVERY CONFIRMATION
- test_confirmDelivery_success: buyer confirms, funds released
- test_confirmDelivery_platformFee: 2.5% goes to treasury
- test_confirmDelivery_agentPayout: 97.5% goes to agent
- test_confirmDelivery_stakeReturned: agent stake returned
- test_confirmDelivery_notBuyer_reverts: only buyer
- test_confirmDelivery_statusComplete: final status = Complete

F. AUTO-RELEASE
- test_autoRelease_after72h_success: 70% released after 72h
- test_autoRelease_before72h_reverts: too early
- test_autoRelease_after96h_fullRelease: remaining 30% after 96h
- test_autoRelease_notDelivered_reverts: must be Delivered status
- test_autoRelease_correctAmounts: verify 70/30 split math

G. JOB CANCELLATION
- test_cancelJob_openStatus: buyer cancels Open job, full refund
- test_cancelJob_assignedStatus: buyer cancels Assigned job, full refund
- test_cancelJob_inProgress_reverts: cannot cancel once agent accepted
- test_cancelJob_notBuyer_reverts: only buyer can cancel

H. REENTRANCY
- test_reentrancy_confirmDelivery: malicious agent cannot reenter on confirm
- test_reentrancy_autoRelease: malicious contract cannot reenter auto-release
```

Write ALL tests listed above. Each test must:
- Use descriptive names
- Assert specific values (not just "doesn't revert")
- Check balance changes with vm.expectEmit or assertEq
- Use vm.prank for caller identity
- Use vm.warp for time-dependent tests
- Use vm.expectRevert for failure cases

### 3. AgentRegistry Tests (test/AgentRegistry.t.sol)

```
Test categories:

A. REGISTRATION
- test_register_success: new agent registers, profile created
- test_register_duplicate_reverts: same address cannot register twice
- test_register_startsApprentice: initial tier = Apprentice
- test_register_emitsEvent: AgentRegistered event

B. AVAILABILITY
- test_toggleAvailability: Available → Unavailable → Available
- test_unavailable_notAssignable: unavailable agents filtered from eligible list

C. STAKING
- test_stake_success: agent stakes ETH, currentStake increases
- test_unstake_success: agent withdraws partial stake
- test_unstake_overWithdraw_reverts: cannot withdraw more than staked

D. TIER PROMOTION
- test_promotion_toProven: 3 completed jobs → Proven
- test_promotion_toExpert: 10 completed jobs + top 25% → Expert
- test_noPromotion_withDisputes: disputed jobs delay promotion
- test_promotion_emitsEvent: TierPromoted event

E. ACCESS CONTROL
- test_recordJob_onlyJobEscrow: only authorized escrow can call
- test_recordJob_unauthorized_reverts: random caller rejected
```

### 4. ReputationEngine Tests (test/ReputationEngine.t.sol)

```
Test categories:

A. SCORE CALCULATION
- test_firstJob_setsScore: first completed job creates initial score
- test_multipleJobs_weightedAverage: score reflects weighted calculation
- test_buyerWalletScore_newWallet: <30 days = score 5
- test_buyerWalletScore_midWallet: 30-180 days = score 40
- test_buyerWalletScore_oldWallet: >180 days = score 100
- test_timeDecay_recentJob: recent job has higher weight
- test_timeDecay_oldJob: 364-day-old job has near-zero weight
- test_disputeReducesScore: disputed job gets 50 vs 100 bonus

B. COMPONENT SCORES
- test_technicalScore_fromCodeJobs: code review jobs boost technical
- test_reliabilityScore_fromCompletions: on-time completions boost reliability
- test_collaborationScore_fromReviews: review tasks boost collaboration

C. LEADERBOARD
- test_leaderboard_sortedDescending: highest score first
- test_leaderboard_pagination: offset/limit work correctly
- test_leaderboard_updatesOnNewJob: new job recalculates position

D. ACCESS CONTROL
- test_recordJob_onlyJobEscrow: restricted caller
- test_setJobEscrow_onlyOwner: only owner can set
```

### 5. Integration Tests (test/Integration.t.sol)

```
End-to-end flow tests:

A. HAPPY PATH
- test_e2e_fullJobLifecycle: register → create → assign → accept → deliver → confirm → check reputation
- test_e2e_multipleJobsReputation: 3 jobs completed, verify tier promotion to Proven

B. EDGE CASES
- test_e2e_autoReleaseFlow: create → assign → accept → deliver → warp 72h → auto-release
- test_e2e_cancelBeforeAccept: create → assign → cancel → verify refund
- test_e2e_maxActiveJobs: agent accepts 3 jobs → 4th assignment reverts

C. ADVERSARIAL
- test_e2e_washTrading: same entity as buyer+agent, verify low reputation weight
- test_e2e_newWalletLowWeight: brand new buyer wallet, verify minimal rep contribution
```

### 6. Run Tests & Fix Bugs

```bash
# Run all tests
forge test -vvv

# Run with gas reporting
forge test --gas-report

# Run specific test file
forge test --match-path test/JobEscrow.t.sol -vvv

# Run specific test
forge test --match-test test_autoRelease_after72h_success -vvvv
```

For EVERY test failure:
1. Read the error message carefully
2. Identify root cause (contract bug vs test bug)
3. Fix the source (prefer fixing contract if spec mismatch, fix test if test is wrong)
4. Re-run to confirm fix
5. Document the bug and fix in a comment above the test

### 7. Gas Optimization Check

After all tests pass:
```bash
forge test --gas-report > gas-report.txt
```

Review gas-report.txt:
- createJob should be <200K gas
- confirmDelivery should be <150K gas
- registerAgent should be <200K gas
- If any function exceeds these, add a TODO comment

### 8. Security Audit Notes (docs/SECURITY.md)

Create security audit document:

```markdown
# Security Audit Notes

## Methodology
- Foundry fuzz testing (256 runs)
- Manual review of all external functions
- Reentrancy analysis
- Access control verification

## Findings

### Mitigated
- [List any bugs found and fixed during testing]

### Known Limitations
- Wallet age scoring uses block.timestamp (can be manipulated ±15s by miners)
- Leaderboard sorting is O(n) — fine for hackathon scale, needs optimization for production
- No formal verification performed

### Recommendations for Production
- Professional audit before mainnet deployment
- Add circuit breaker (pausable) for emergency
- Implement upgradeable proxy pattern for future fixes
```

## Verification

1. `forge test` — ALL tests pass (green)
2. `forge test --gas-report` — no function exceeds 300K gas
3. Zero compiler warnings
4. docs/SECURITY.md exists with findings

## Completion

Update MANIFEST.md:
- [x] P6: JobEscrow tests (8 categories, ~20 tests)
- [x] P6: AgentRegistry tests (5 categories, ~12 tests)
- [x] P6: ReputationEngine tests (4 categories, ~12 tests)
- [x] P6: Integration tests (3 categories, ~7 tests)
- [x] P6: All tests passing
- [x] P6: Gas report generated
- [x] P6: Security audit notes written
- [x] P6: Bugs found and fixed (list count)
```

---

## Verification Checklist

- [ ] test/helpers/TestSetup.sol exists with all helpers
- [ ] test/JobEscrow.t.sol has all 8 test categories
- [ ] test/AgentRegistry.t.sol has all 5 test categories
- [ ] test/ReputationEngine.t.sol has all 4 test categories
- [ ] test/Integration.t.sol has all 3 test categories
- [ ] `forge test` — ALL tests pass
- [ ] `forge test --gas-report` — generated and reviewed
- [ ] No function exceeds 300K gas
- [ ] All bugs found during testing are fixed in source contracts
- [ ] Bug fixes documented in test comments
- [ ] docs/SECURITY.md created with findings
- [ ] MANIFEST.md updated with P6 status
