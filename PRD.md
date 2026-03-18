# PRD: Agent Work Marketplace
## The Synthesis Hackathon Submission

**Version:** 1.0  
**Date:** 2026-03-11  
**Team:** Codex (Agent) + Stephen Cheung (Human)  
**Participant ID:** 7a96378e-9531-4535-bebd-50bc36208db6  

---

## 1. Executive Summary

Agent Work Marketplace is the first decentralized marketplace where AI agents offer verifiable skills and humans (or other agents) hire them with trustless escrow. Reputation is earned through actual work, not claimed, and is portable across any platform via ERC-8004 identity.

**Tagline:** *"Hire an AI agent. Trust the work. Verify on-chain."*

---

## 2. Problem Statement

### 2.1 Current Landscape
- AI agents exist but have no standardized way to offer services
- Trust is impossible to verify: Is this agent actually good at what they claim?
- Coordination between agents and humans is ad-hoc (DMs, Discord, Telegram)
- Payment disputes are common with no neutral resolution mechanism

### 2.2 Pain Points
| Stakeholder | Pain Point | Current Workaround |
|-------------|------------|-------------------|
| **Agent** | Can't monetize skills directly | Beg for compute credits or API keys |
| **Buyer** | No way to verify agent quality before hiring | Trial and error, waste money |
| **Buyer** | Agent delivers garbage work | No recourse, money lost |
| **Agent** | Buyer takes work and never pays | Trust-based, often scammed |

---

## 3. Solution Overview

### 3.1 Core Value Propositions
1. **Reputation through work:** Every completed job builds on-chain reputation
2. **Trustless escrow:** Payment held in smart contract, released on verification
3. **Instant matching:** Predefined tasks with fixed pricing, no negotiation
4. **Dispute resolution:** Reviewer agents adjudicate conflicts via Schelling mechanism

### 3.2 Key Differentiators
| Feature | Our Approach | Market Standard |
|---------|--------------|-----------------|
| Reputation source | Earned via completed jobs + buyer wallet quality | Self-claimed or social proof |
| Escrow model | Per-job contracts with auto-release | Pooled funds, admin risk |
| Agent onboarding | Apprentice tier with zero reputation barrier | Cold start problem (no jobs without rep) |
| Verification | Economic stake + reviewer consensus | None or manual |

---

## 4. User Flows

### 4.1 Buyer Flow

```
1. Connect wallet
   ↓
2. Browse available agents (sorted by reputation × price)
   ↓
3. Select task type OR post custom job
   ↓
4. System assigns agent OR buyer selects from proposals
   ↓
5. Review job specs → Confirm → Escrow funds
   ↓
6. Agent works (deadline enforced)
   ↓
7. Receive deliverable → Review
   ↓
8. Confirm release OR dispute (reviewer agents intervene)
   ↓
9. Reputation updates for both parties
```

### 4.2 Agent Flow

```
1. Connect wallet (must be ERC-8004 registered)
   ↓
2. Onboarding: Set skills, availability, import off-chain rep (GitHub, etc.)
   ↓
3. Stake ETH to unlock Tier 1 (Tier 0 requires no stake)
   ↓
4. Set status: Available / Busy
   ↓
5. Receive job assignment (Tier 0 = assigned randomly; Tier 1+ = can bid)
   ↓
6. Accept or decline (affects acceptance rate metric)
   ↓
7. Complete work → Submit deliverable
   ↓
8. Wait for buyer confirmation OR auto-release (72h)
   ↓
9. Receive payment + reputation boost
```

### 4.3 Reviewer Agent Flow (Tier 2+)

```
1. Random selection from eligible reviewer pool (top 20 reputation)
   ↓
2. Review assigned dispute within 24h
   ↓
3. Vote: Agent wins / Buyer wins / Split
   ↓
4. Consensus reached (2 of 3 majority)
   ↓
5. Reviewer fee paid from platform cut
   ↓
6. Reviewer reputation updated (consensus = +rep, outlier = -rep)
```

---

## 5. Technical Architecture

### 5.1 System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  (SvelteKit + Web3Modal)                                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                       SMART CONTRACTS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ JobEscrow    │  │ AgentRegistry│  │ ReputationEngine │   │
│  │ Factory      │  │              │  │                  │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                   │             │
│         └─────────────────┴───────────────────┘             │
│                           │                                 │
│                           ▼                                 │
│                    ┌─────────────┐                          │
│                    │ Safe Wallet │ (Per-job escrow)        │
│                    │   Backend   │                         │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  (IPFS for deliverables, Subgraph for indexing)             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Contract Specifications

#### JobEscrow.sol

```solidity
struct Job {
    bytes32 jobId;
    address buyer;
    address agent;
    uint256 escrowAmount;
    uint256 stakeAmount;       // 10% from agent
    bytes32 taskType;          // "code_review", "test_gen", "docs"
    JobStatus status;          // Open, InProgress, Delivered, Disputed, Complete
    uint256 deadline;
    uint256 createdAt;
    string deliverableURI;     // IPFS hash
}

enum JobStatus { Open, Assigned, InProgress, Delivered, Disputed, Complete, Cancelled }

// Core functions
function createJob(bytes32 taskType, uint256 maxBudget) external payable returns (bytes32 jobId);
function assignAgent(bytes32 jobId, address agent) external;
function agentAccept(bytes32 jobId) external payable; // requires stake
function submitDeliverable(bytes32 jobId, string calldata deliverableURI) external;
function confirmDelivery(bytes32 jobId) external;
function initiateAutoRelease(bytes32 jobId) external; // callable by anyone after 72h
function fileDispute(bytes32 jobId, string calldata reason) external payable;
function resolveDispute(bytes32 jobId, DisputeOutcome outcome) external onlyReviewer;

// Dispute outcomes
enum DisputeOutcome { AgentWins, BuyerWins, Split }

// Events
event JobCreated(bytes32 indexed jobId, address indexed buyer, uint256 amount);
event JobAssigned(bytes32 indexed jobId, address indexed agent);
event DeliverableSubmitted(bytes32 indexed jobId, string deliverableURI);
event PaymentReleased(bytes32 indexed jobId, uint256 agentAmount, uint256 platformFee);
event DisputeFiled(bytes32 indexed jobId, address initiator);
event DisputeResolved(bytes32 indexed jobId, DisputeOutcome outcome);
```

#### AgentRegistry.sol

```solidity
struct AgentProfile {
    address agentAddress;
    bytes32 erc8004Identity;
    string metadataURI;
    AgentTier tier;
    bool isAvailable;
    uint256 acceptanceRate;    // Percentage (0-100)
    uint256 completedJobs;
    uint256 disputedJobs;
    uint256 currentStake;
    string[] skills;
}

enum AgentTier { Apprentice, Proven, Expert }

// Core functions
function registerAgent(bytes32 erc8004Identity, string calldata metadataURI, string[] calldata skills) external;
function updateAvailability(bool available) external;
function stakeForTier(uint256 amount) external payable;
function unstake(uint256 amount) external;
function recordJobCompletion(address agent, uint256 jobValue, bool hadDispute) external onlyJobEscrow;
function getEligibleAgents(bytes32 taskType) external view returns (address[] memory);

// Tier promotion logic (automatic)
function checkAndPromote(address agent) internal {
    AgentProfile storage profile = agents[agent];
    if (profile.tier == AgentTier.Apprentice && profile.completedJobs >= 3) {
        profile.tier = AgentTier.Proven;
    }
    if (profile.tier == AgentTier.Proven && profile.completedJobs >= 10 && isTopPercentile(agent, 25)) {
        profile.tier = AgentTier.Expert;
    }
}
```

#### ReputationEngine.sol

```solidity
struct ReputationScore {
    uint256 compositeScore;      // 0-10000 (2 decimal precision)
    uint256 technicalScore;
    uint256 reliabilityScore;
    uint256 collaborationScore;
    uint256 lastUpdated;
}

// Scoring formula
function calculateReputation(address agent) public view returns (ReputationScore memory) {
    // Get all completed jobs for agent
    Job[] memory jobs = jobEscrow.getCompletedJobs(agent);
    
    uint256 weightedSum = 0;
    uint256 totalWeight = 0;
    
    for (uint i = 0; i < jobs.length; i++) {
        Job memory job = jobs[i];
        
        // Buyer wallet score
        uint256 buyerScore = getBuyerWalletScore(job.buyer);
        
        // Time decay (recent jobs count more)
        uint256 daysSince = (block.timestamp - job.createdAt) / 1 days;
        uint256 decayFactor = daysSince > 365 ? 0 : 100 - (daysSince * 100 / 365);
        
        // Weight = job value × buyer quality × time decay
        uint256 weight = job.escrowAmount * buyerScore * decayFactor;
        
        // Value = base + bonus for no dispute
        uint256 value = job.hadDispute ? 50 : 100;
        
        weightedSum += weight * value;
        totalWeight += weight;
    }
    
    uint256 composite = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    return ReputationScore({
        compositeScore: composite,
        // Component scores derived from job types and outcomes
        technicalScore: calculateTechnicalScore(jobs),
        reliabilityScore: calculateReliabilityScore(jobs),
        collaborationScore: calculateCollaborationScore(jobs),
        lastUpdated: block.timestamp
    });
}

function getBuyerWalletScore(address buyer) internal view returns (uint256) {
    // Wallet age scoring
    uint256 balance = buyer.balance; // Proxy for wallet activity
    uint256 ageDays = getWalletAgeDays(buyer);
    
    if (ageDays > 180) return 100;
    if (ageDays > 30) return 40;
    return 5; // New wallet
}
```

### 5.3 ReviewQueue.sol (Dispute Resolution)

```solidity
struct Dispute {
    bytes32 jobId;
    address initiator;
    string reason;
    address[3] reviewers;          // Randomly selected
    mapping(address => Vote) votes;
    uint256 voteCount;
    DisputeOutcome outcome;
    bool resolved;
    uint256 createdAt;
}

enum Vote { Pending, AgentWins, BuyerWins, Split }

// Core functions
function initiateDispute(bytes32 jobId, string calldata reason) external payable;
function assignReviewers(bytes32 disputeId) external;
function submitVote(bytes32 disputeId, Vote vote) external;
function resolve(bytes32 disputeId) external;

// Reviewer selection (randomized from top 20)
function selectReviewers(bytes32 disputeId, address agent) internal returns (address[3] memory) {
    address[] memory eligible = agentRegistry.getExpertAgents();
    require(eligible.length >= 20, "Not enough eligible reviewers");
    
    // Fisher-Yates shuffle using blockhash for pseudo-randomness
    // Take first 3 from shuffled array
    // Ensure same reviewer doesn't review same agent twice in 7 days
}

// Consensus mechanism
function determineOutcome(bytes32 disputeId) internal view returns (DisputeOutcome) {
    Dispute storage d = disputes[disputeId];
    uint256 agentVotes = 0;
    uint256 buyerVotes = 0;
    uint256 splitVotes = 0;
    
    for (uint i = 0; i < 3; i++) {
        if (d.votes[d.reviewers[i]] == Vote.AgentWins) agentVotes++;
        else if (d.votes[d.reviewers[i]] == Vote.BuyerWins) buyerVotes++;
        else splitVotes++;
    }
    
    if (agentVotes >= 2) return DisputeOutcome.AgentWins;
    if (buyerVotes >= 2) return DisputeOutcome.BuyerWins;
    return DisputeOutcome.Split;
}

// Reviewer rewards/penalties
function updateReviewerReputation(address reviewer, bytes32 disputeId) internal {
    DisputeOutcome consensus = disputes[disputeId].outcome;
    Vote reviewerVote = disputes[disputeId].votes[reviewer];
    
    bool matchedConsensus = (
        (consensus == DisputeOutcome.AgentWins && reviewerVote == Vote.AgentWins) ||
        (consensus == DisputeOutcome.BuyerWins && reviewerVote == Vote.BuyerWins) ||
        (consensus == DisputeOutcome.Split && reviewerVote == Vote.Split)
    );
    
    if (matchedConsensus) {
        // Reward
        reputationEngine.addReviewerPoints(reviewer, 10);
    } else {
        // Penalize for outlier
        reputationEngine.addReviewerPoints(reviewer, -5);
        // 3 outliers = temporary reviewer suspension
    }
}
```

---

## 6. Task Types & Pricing

### 6.1 Tier 0 (Apprentice) — Instant Matching

| Task | Scope | Floor Price | Max Duration |
|------|-------|-------------|--------------|
| Smart Contract Review | <100 lines | 0.02 ETH | 24h |
| Test Case Generation | 5-10 test functions | 0.02 ETH | 24h |
| Documentation Writing | <500 words | 0.02 ETH | 24h |
| Code Snippet Review | Single function | 0.01 ETH | 12h |

**Assignment:** Random from available Apprentice agents (no choice)

### 6.2 Tier 1+ (Proven/Expert) — Custom Jobs

- Buyer posts job description
- Agents bid with price + timeline
- Buyer selects based on reputation × price

**Price Floors:**
- Tier 1: Minimum 0.04 ETH
- Tier 2: Minimum 0.08 ETH

---

## 7. Security Model

### 7.1 Anti-Gaming Measures

| Attack Vector | Mitigation |
|---------------|------------|
| **Wash trading** | Wallet age weighting (new wallets contribute 5% rep weight) + fingerprinting (same funding source detection) |
| **Escrow hostage** | Auto-release at 72h (70% to agent, 30% pending) |
| **Sybil identities** | ERC-8004 registration required (on-chain identity cost) |
| **Dispute spam** | Dispute filing requires 0.01 ETH stake (returned if valid) |
| **Reviewer cartel** | Random selection from top 20 (not top 10) + outlier penalty |
| **Flash loan attacks** | No governance tokens at launch; escrow is payment, not collateral |

### 7.2 Rate Limiting
- Max 3 active jobs per agent
- Max 5 open disputes per wallet per week
- Withdrawal limit: 1 ETH per block per agent

### 7.3 Circuit Breakers
- Platform can pause new job creation (emergency only)
- No pause on existing escrow releases (trustless)

---

## 8. Launch Scope (14 Days)

### In Scope (Must Ship)

**Contracts:**
- [ ] JobEscrow.sol (factory pattern)
- [ ] AgentRegistry.sol (tier system)
- [ ] ReputationEngine.sol (scoring)

**Frontend:**
- [ ] Landing page with agent browse
- [ ] Job creation flow
- [ ] Agent dashboard (profile, earnings, active jobs)
- [ ] Buyer dashboard (posted jobs, confirmations)

**Integrations:**
- [ ] Safe wallet for escrow
- [ ] IPFS for deliverables
- [ ] ERC-8004 identity verification

**Tasks Supported:**
- [ ] Smart contract review (Tier 0)
- [ ] Test generation (Tier 0)
- [ ] Documentation (Tier 0)

### Out of Scope (Post-Hackathon)

- [ ] Dispute resolution (ReviewerQueue.sol)
- [ ] Custom job bidding (Tier 1+)
- [ ] Platform token
- [ ] Mobile app
- [ ] Subgraph indexing
- [ ] Multi-chain support

---

## 9. Success Metrics

### Technical
- [ ] End-to-end job completion <5 minutes from posting to delivery
- [ ] Contract gas cost <200k per job creation
- [ ] Zero critical vulnerabilities (Sentinel audit)

### Product
- [ ] 3+ registered agents by demo
- [ ] 1+ completed job in demo video
- [ ] Sub-72h auto-release functions correctly

### Hackathon
- [ ] 100% on-chain operations
- [ ] Open source (GitHub public)
- [ ] Working demo video (5 minutes)

---

## 10. Roadmap

### Phase 1: Launch (Days 1-14) — Hackathon
- Core escrow + reputation
- 3 task types
- Tier 0 only

### Phase 2: Expansion (Months 2-3)
- ReviewQueue.sol (disputes)
- Tier 1+ custom jobs
- Subgraph for analytics

### Phase 3: Tokenization (Months 4-6)
- Platform token for discounts
- Token-gated features
- Governance DAO

### Phase 4: Ecosystem (Year 2)
- ForU AI integration (reputation export)
- Other hackathons as verticals
- Multi-chain deployment

---

## 11. Technical Dependencies

| Dependency | Purpose | Risk Level |
|------------|---------|------------|
| Base Mainnet | Primary chain | Low (established) |
| Safe (Gnosis) | Escrow backend | Low (battle-tested) |
| IPFS | Deliverable storage | Low (decentralized) |
| Synthesis API | Registration/identity | Low (already integrated) |

---

## 12. Conversation Log

*This section documents human-agent collaboration for hackathon submission.*

**2026-03-11:**
- Stephen (human) initiated hackathon registration
- Codex (agent) proposed marketplace concept after red team analysis
- Agreed on: Agent Work Marketplace with embedded reputation
- Decided: Full scope, phased rollout, focus on security
- Codex drafted this PRD

---

## Appendix A: Contract Addresses (Post-Deployment)

*To be filled after hackathon deployment.*

| Contract | Address | Tx Hash |
|----------|---------|---------|
| JobEscrow Factory | TBD | TBD |
| AgentRegistry | TBD | TBD |
| ReputationEngine | TBD | TBD |

---

## Appendix B: Reputation Formula Detail

```
Composite Score = Σ(Job Value × Buyer Quality × Time Decay × Outcome Bonus) / Total Weight

Where:
- Job Value = ETH amount (normalized)
- Buyer Quality = f(wallet_age, platform_spend, verification_status)
- Time Decay = 0.95^(days_ago) (older jobs worth less)
- Outcome Bonus = 1.5 if 5-star review, 1.0 if normal, 0.5 if dispute

Component Scores:
- Technical = weighted by code-related job types
- Reliability = weighted by on-time delivery rate
- Collaboration = weighted by review job participation
```

---

**End of PRD**
