# Phase 1: Core Contracts Build Prompt

**Phase:** P1-CONTRACTS-CORE  
**Est. Context:** ~8K tokens (under 40% budget)  
**Dependencies:** MANIFEST.md, PRD.md (sections 5.2, 7)  
**Output:** `src/interfaces/IJobEscrow.sol`, `src/interfaces/IAgentRegistry.sol`, `src/JobEscrow.sol`, `src/JobEscrowFactory.sol`, `src/AgentRegistry.sol`

---

## Build Prompt

```prompt
You are building the core smart contracts for Agent Work Marketplace — a decentralized marketplace where AI agents offer skills and humans hire them via on-chain escrow.

CHAIN: Base Mainnet | FRAMEWORK: Foundry v1.5.1 (Solidity 0.8.24)

CRITICAL ENVIRONMENT:
- Run `export PATH="$HOME/.foundry/bin:$PATH"` before any forge command
- Use `--no-git` flag (NOT `--no-commit` which was removed in Foundry v1.5)
- ERC-8004 is a Draft EIP — we store the identity as bytes32 from Synthesis registration, we do NOT import/implement the full EIP-8004 interface
- Architecture: Single factory contract with job struct mappings (NOT deploying new contracts per job — too expensive for demo)

## Step 1: Read Context Files
1. Read MANIFEST.md for project structure and conventions
2. Read PRD.md sections 5.2 (contract specifications) and 7 (security model)

## Step 2: Build Interfaces First

### IJobEscrow.sol
Create interface with:
- Events: JobCreated, JobAssigned, JobAccepted, DeliverableSubmitted, DeliveryConfirmed, JobDisputed, JobCompleted, JobCancelled, AutoReleaseTriggered
- Functions: createJob(bytes32 taskType, uint256 deadline) payable returns (bytes32), assignAgent(bytes32 jobId, address agent), agentAccept(bytes32 jobId) payable, submitDeliverable(bytes32 jobId, string calldata uri), confirmDelivery(bytes32 jobId), initiateAutoRelease(bytes32 jobId), fileDispute(bytes32 jobId, string calldata reason) payable, cancelJob(bytes32 jobId)

### IAgentRegistry.sol
Create interface with:
- Events: AgentRegistered, AgentUpdated, AvailabilityChanged, StakeDeposited, StakeWithdrawn, TierPromoted, JobRecorded
- Functions: registerAgent(bytes32 erc8004Identity, string calldata metadataURI, bytes32[] calldata skills), updateAvailability(bool isAvailable), updateMetadata(string calldata uri), stakeForTier() payable, unstake(uint256 amount), recordJobCompletion(address agent, uint256 jobValue, bool hadDispute), getEligibleAgents(bytes32 taskType) view returns (address[]), getAgentProfile(address agent) view returns (tuple)

## Step 3: Build Implementations

### JobEscrowFactory.sol
- Factory pattern: deploys individual JobEscrow instances per job
- Maps jobId => JobEscrow address
- Tracks active jobs per agent (max 3)
- Stores treasury address (Ownable)

### JobEscrow.sol
Structs:
```solidity
struct Job {
    bytes32 jobId;
    address buyer;
    address agent;
    uint256 escrowAmount;
    uint256 stakeAmount;
    bytes32 taskType;
    JobStatus status;
    uint256 deadline;
    uint256 createdAt;
    uint256 deliveredAt;
    string deliverableURI;
}

enum JobStatus { Open, Assigned, InProgress, Delivered, Disputed, Complete, Cancelled }
```

Functions:
- createJob(taskType, deadline) payable → creates job, emits JobCreated
- assignAgent(jobId, agent) → buyer assigns agent, status → Assigned
- agentAccept(jobId) payable → agent accepts with 10% stake, status → InProgress
- submitDeliverable(jobId, uri) → agent submits work, status → Delivered, records deliveredAt
- confirmDelivery(jobId) → buyer confirms, releases funds (97.5% to agent, 2.5% to treasury)
- initiateAutoRelease(jobId) → callable 72h after delivery: 70% to agent; 96h: remaining 30%
- fileDispute(jobId, reason) payable → 0.01 ETH fee, status → Disputed
- cancelJob(jobId) → buyer cancels if Open/Assigned, refund escrow

Security:
- ReentrancyGuard on all payment functions
- Ownable for treasury management
- Validations: deadline > block.timestamp, msg.value > 0 for createJob, correct stake amount for agentAccept

### AgentRegistry.sol
Structs:
```solidity
struct AgentProfile {
    address agentAddress;
    bytes32 erc8004Identity;
    string metadataURI;
    AgentTier tier;
    bool isAvailable;
    uint256 acceptanceRate; // 0-100
    uint256 completedJobs;
    uint256 disputedJobs;
    uint256 currentStake;
    uint256 registeredAt;
    bytes32[] skills;
}

enum AgentTier { Apprentice, Proven, Expert }
```

Functions:
- registerAgent(erc8004Identity, metadataURI, skills[]) → creates profile at Apprentice tier
- updateAvailability(bool) → toggles isAvailable
- updateMetadata(uri) → updates metadataURI
- stakeForTier() payable → stake for tier upgrade eligibility (Tier 1: 0.05 ETH min, Tier 2: 0.1 ETH min)
- unstake(amount) → withdraw stake (must maintain tier minimum)
- recordJobCompletion(agent, jobValue, hadDispute) → only callable by JobEscrow contracts, updates stats
- getEligibleAgents(taskType) view → returns agents with matching skills and availability
- getAgentProfile(agent) view → returns full profile

Auto-promotion logic (in recordJobCompletion):
- 3 completed jobs → Proven tier
- 10 jobs + top 25% acceptance rate → Expert tier

Access control:
- Only registered JobEscrow contracts can call recordJobCompletion
- Maintains mapping: isAuthorizedJobEscrow[address] => bool

## Step 4: NatSpec Comments
Add NatSpec comments on all public/external functions with @notice, @param, @return, @dev where needed.

## Step 5: Build & Verify
1. Run `forge build`
2. Fix any compilation errors
3. Update MANIFEST.md checklist: mark P1 interfaces and contracts complete

## File Structure
```
src/
├── interfaces/
│   ├── IJobEscrow.sol
│   └── IAgentRegistry.sol
├── JobEscrow.sol
├── JobEscrowFactory.sol
└── AgentRegistry.sol
```

## Security Notes from PRD Section 7
- All external calls must follow checks-effects-interactions pattern
- Use ReentrancyGuard from OpenZeppelin
- Validate all inputs (non-zero addresses, valid statuses, etc.)
- Platform fee treasury must be set on deployment (immutable or Ownable)
```

---

## Verification Checklist

- [ ] IJobEscrow.sol created with all events and function signatures
- [ ] IAgentRegistry.sol created with all events and function signatures
- [ ] JobEscrow.sol compiles with correct struct and enum definitions
- [ ] JobEscrowFactory.sol implements factory pattern with rate limiting (max 3 active jobs per agent)
- [ ] AgentRegistry.sol implements tier system with auto-promotion logic
- [ ] ReentrancyGuard applied to all payment functions
- [ ] Ownable applied for treasury address management
- [ ] NatSpec comments present on all public functions
- [ ] Access control: only JobEscrow can call recordJobCompletion
- [ ] `forge build` succeeds without errors
- [ ] MANIFEST.md checklist updated
