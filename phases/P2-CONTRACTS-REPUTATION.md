# Phase 2: Reputation Engine & Contract Wiring

**Phase:** P2-CONTRACTS-REPUTATION  
**Est. Context:** ~8K tokens  
**Dependencies:** P1-CONTRACTS-CORE (JobEscrow.sol, AgentRegistry.sol)  
**Output:** ReputationEngine.sol, IReputationEngine.sol, Types.sol, updated P1 contracts  

---

## CRITICAL: Environment

- Run `export PATH="$HOME/.foundry/bin:$PATH"` before any forge command
- "Buyer wallet age" is actually "platform tenure" — we track first interaction with OUR contracts via a `firstInteraction` mapping. We cannot determine true wallet creation date on-chain.
- Use `--no-git` flag (NOT `--no-commit`) for any forge install commands

---

## Build Prompt

```
You are building Phase 2 of the Agent Work Marketplace smart contracts.

### STEP 1: READ EXISTING FILES
Read these files in order:
1. MANIFEST.md — project overview and checklist
2. src/JobEscrow.sol — existing escrow contract
3. src/AgentRegistry.sol — existing registry contract

### STEP 2: CREATE Types.sol
Create src/libraries/Types.sol with shared types:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Types {
    enum TaskType { Development, Design, Writing, Analysis, Other }
    
    struct ReputationScore {
        uint256 compositeScore;      // 0-10000 basis points
        uint256 technicalScore;
        uint256 reliabilityScore;
        uint256 collaborationScore;
        uint256 lastUpdated;
    }
    
    struct JobRecord {
        address agent;
        address buyer;
        uint256 jobValue;
        TaskType taskType;
        uint256 completedAt;
        bool hadDispute;
        uint256 buyerWalletAge;
    }
}
```

### STEP 3: CREATE IReputationEngine.sol
Create src/interfaces/IReputationEngine.sol:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Types } from "../libraries/Types.sol";

interface IReputationEngine {
    function recordJob(
        address agent,
        address buyer,
        uint256 jobValue,
        Types.TaskType taskType,
        bool hadDispute
    ) external;
    
    function getReputation(address agent) external view returns (Types.ReputationScore memory);
    
    function getLeaderboard(uint256 offset, uint256 limit) external view returns (address[] memory, uint256[] memory);
    
    function getBuyerWalletScore(address buyer) external view returns (uint256);
}
```

### STEP 4: BUILD ReputationEngine.sol
Create src/ReputationEngine.sol implementing IReputationEngine:

KEY IMPLEMENTATION REQUIREMENTS:

1. **Storage:**
   - mapping(address => Types.ReputationScore) public reputationScores
   - mapping(address => uint256) public firstInteraction — track buyer wallet age
   - JobRecord[] internal jobRecords
   - address[] internal agentList — for leaderboard

2. **Access Control:**
   - address public jobEscrow
   - modifier onlyJobEscrow() — restricts recordJob to JobEscrow contract
   - setJobEscrow(address) external onlyOwner

3. **Scoring Formula:**
   ```
   Score = Σ(job_value × buyer_wallet_score × time_decay × outcome_bonus) / total_weight
   ```
   
   - buyer_wallet_score: 
     - wallet age > 180 days = 100
     - wallet age 30-180 days = 40  
     - wallet age < 30 days = 5
   
   - time_decay: linear decay over 365 days
     - decay = max(0, 1 - (now - completedAt) / 365 days)
   
   - outcome_bonus:
     - no dispute = 100
     - dispute resolved for agent = 75
     - dispute = 50

4. **Component Scores from TaskType:**
   - Development: technicalScore += weight
   - Design: collaborationScore += weight  
   - Writing: collaborationScore += weight
   - Analysis: technicalScore += weight
   - Other: reliabilityScore += weight

5. **recordJob Function:**
   - Only callable by JobEscrow
   - Track first buyer interaction timestamp
   - Push to jobRecords array
   - Add agent to agentList if new
   - Recalculate composite and component scores
   - Update lastUpdated timestamp

6. **getLeaderboard(offset, limit):**
   - Return sorted array by compositeScore descending
   - Use pagination with offset/limit
   - Return addresses and scores

### STEP 5: UPDATE JobEscrow.sol
Add cross-contract references:

1. Add state variables:
   ```solidity
   IAgentRegistry public agentRegistry;
   IReputationEngine public reputationEngine;
   ```

2. Add setter functions (onlyOwner):
   ```solidity
   function setAgentRegistry(address _registry) external onlyOwner;
   function setReputationEngine(address _reputationEngine) external onlyOwner;
   ```

3. In job completion flow, call:
   ```solidity
   reputationEngine.recordJob(agent, buyer, jobValue, taskType, hadDispute);
   ```

4. Check agent eligibility before job start:
   ```solidity
   require(agentRegistry.isActive(agent), "Agent not active");
   ```

### STEP 6: UPDATE AgentRegistry.sol
Add cross-contract references:

1. Add state variable:
   ```solidity
   IReputationEngine public reputationEngine;
   ```

2. Add setter function (onlyOwner):
   ```solidity
   function setReputationEngine(address _reputationEngine) external onlyOwner;
   ```

3. Add tier promotion function (called by owner or automated):
   - Get agent reputation score
   - Promote tier based on percentile:
     - Top 10% → Platinum
     - Top 30% → Gold  
     - Top 60% → Silver
     - Below → Bronze

### STEP 7: BUILD & VERIFY
Run:
```bash
forge build
```

Fix any compilation errors.

### STEP 8: UPDATE MANIFEST.md
Update the checklist:
- [x] P2: Types.sol created
- [x] P2: IReputationEngine.sol created
- [x] P2: ReputationEngine.sol implemented
- [x] P2: JobEscrow wired to AgentRegistry and ReputationEngine
- [x] P2: AgentRegistry wired to ReputationEngine
- [x] P2: forge build passes
```

---

## Verification Checklist

- [ ] Types.sol exists in src/libraries/ with TaskType enum and structs
- [ ] IReputationEngine.sol exists in src/interfaces/ with all 4 functions
- [ ] ReputationEngine.sol implements all interface functions
- [ ] recordJob restricted to onlyJobEscrow modifier
- [ ] Scoring formula correctly implements weighted calculation
- [ ] Buyer wallet score returns correct values (100/40/5)
- [ ] Time decay is linear over 365 days with minimum 0
- [ ] Outcome bonus returns correct values (100/75/50)
- [ ] Component scores derived from TaskType correctly
- [ ] Leaderboard sorted by compositeScore descending
- [ ] JobEscrow has setter for agentRegistry and reputationEngine
- [ ] JobEscrow calls reputationEngine.recordJob on completion
- [ ] AgentRegistry has setter for reputationEngine
- [ ] AgentRegistry has tier promotion based on percentile
- [ ] `forge build` compiles without errors
- [ ] MANIFEST.md checklist updated
