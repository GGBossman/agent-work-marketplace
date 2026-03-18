# Phase 7: Deployment, Documentation & Cleanup

**Phase:** P7-DEPLOY-DOCS  
**Est. Context:** ~20K tokens (under 50% budget)  
**Dependencies:** ALL previous phases (P0-P6 must be complete)  
**Output:** Deployed contracts on Base, public README, architecture docs, demo script, workspace cleanup  

---

## CRITICAL: Environment

- Run `export PATH="$HOME/.foundry/bin:$PATH"` before any forge command
- Foundry v1.5.1 uses `--no-git` (NOT `--no-commit`)
- Technology stack: SvelteKit 5, TailwindCSS v4 (@tailwindcss/vite), Reown AppKit, @wagmi/core

---

## Build Prompt

```
You are building the FINAL phase of the Agent Work Marketplace — deployment, documentation, and project cleanup.

CRITICAL: Run `export PATH="$HOME/.foundry/bin:$PATH"` before any forge command.

## Pre-flight

READ THESE FILES FIRST:
1. projects/synthesis/MANIFEST.md — source of truth, verify ALL phases P0-P6 are ✅
2. projects/synthesis/PRD.md — sections 9 (Success Metrics), 10 (Roadmap), 12 (Conversation Log)
3. projects/synthesis/contracts/foundry.toml — current config
4. projects/synthesis/frontend/package.json — current dependencies

IF any phase P0-P6 is NOT ✅ in MANIFEST.md, STOP and report which phase is incomplete. Do not proceed with deployment until all prior phases pass.

## Build Order

### 1. Deployment Script (contracts/script/Deploy.s.sol)

Create full deployment script:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/AgentRegistry.sol";
import "../src/ReputationEngine.sol";
import "../src/JobEscrowFactory.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy AgentRegistry
        AgentRegistry registry = new AgentRegistry();
        
        // 2. Deploy ReputationEngine
        ReputationEngine reputation = new ReputationEngine();
        
        // 3. Deploy JobEscrowFactory (references registry + reputation + treasury)
        JobEscrowFactory factory = new JobEscrowFactory(
            address(registry),
            address(reputation),
            treasury
        );
        
        // 4. Wire cross-contract references
        registry.setJobEscrow(address(factory));
        registry.setReputationEngine(address(reputation));
        reputation.setJobEscrow(address(factory));
        
        vm.stopBroadcast();
        
        // 5. Log addresses
        console.log("AgentRegistry:", address(registry));
        console.log("ReputationEngine:", address(reputation));
        console.log("JobEscrowFactory:", address(factory));
    }
}
```

### 2. Deploy to Base Sepolia (Testnet First)

```bash
# Set environment
export PRIVATE_KEY=<deployer-private-key>
export TREASURY_ADDRESS=<treasury-address>
export BASE_SEPOLIA_RPC=https://sepolia.base.org

# Deploy to testnet
cd projects/synthesis/contracts
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_RPC \
  --broadcast \
  --verify \
  -vvv

# Record addresses from output
```

After successful testnet deploy:
1. Record all 3 contract addresses
2. Run a manual test transaction (register agent, create job)
3. Verify on BaseScan Sepolia

### 3. Deploy to Base Mainnet

```bash
export BASE_RPC=https://mainnet.base.org

forge script script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_RPC \
  --broadcast \
  --verify \
  -vvv
```

After successful mainnet deploy:
1. Record all 3 contract addresses
2. Update MANIFEST.md Appendix A with addresses and tx hashes
3. Verify all 3 contracts on BaseScan

### 4. Update Frontend Contract Addresses

Edit `frontend/src/lib/contracts/addresses.ts`:
- Replace placeholder addresses with real deployed addresses
- Both Base Sepolia and Base Mainnet entries

Edit `.env.local` and `.env.example`:
- Set real contract addresses

### 5. Build & Deploy Frontend

```bash
cd projects/synthesis/frontend
npm run build

# Output in build/ directory
# Deploy to Vercel, Netlify, or IPFS
```

If deploying to Vercel:
```bash
npx vercel --prod
```

If deploying to IPFS (preferred for hackathon — fully decentralized):
```bash
npx ipfs-deploy build/ -p pinata
```

Record deployment URL.

### 6. README.md (projects/synthesis/README.md)

Write public-facing README:

```markdown
# Agent Work Marketplace

> Hire an AI agent. Trust the work. Verify on-chain.

The first decentralized marketplace where AI agents offer verifiable skills and humans hire them with trustless escrow. Reputation earned through work, portable via ERC-8004 identity.

## 🏗️ Built For

The Synthesis Hackathon — where AI agents and humans build together.

## ✨ Features

- **Trustless Escrow:** Per-job smart contracts hold payment until work is verified
- **Reputation Through Work:** Scores earned from completed jobs, weighted by buyer quality and time decay
- **Tiered Agent System:** Apprentice → Proven → Expert, with automatic promotion
- **Auto-Release:** Funds release automatically after 72h if buyer doesn't respond
- **Anti-Gaming:** Wallet age scoring, stake requirements, rate limiting

## 🏛️ Architecture

| Component | Stack | Description |
|-----------|-------|-------------|
| Smart Contracts | Solidity 0.8.24, Foundry | JobEscrow, AgentRegistry, ReputationEngine |
| Frontend | SvelteKit, TailwindCSS | Agent browse, job creation, dashboards |
| Chain | Base Mainnet | ERC-8004 identity, low gas fees |
| Storage | IPFS (Pinata) | Deliverable files |

## 📜 Contracts

| Contract | Address | BaseScan |
|----------|---------|----------|
| AgentRegistry | `0x...` | [View](https://basescan.org/address/0x...) |
| ReputationEngine | `0x...` | [View](https://basescan.org/address/0x...) |
| JobEscrowFactory | `0x...` | [View](https://basescan.org/address/0x...) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Foundry

### Contracts
\```bash
cd contracts
forge install
forge build
forge test
\```

### Frontend
\```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
\```

## 🔒 Security

- ReentrancyGuard on all payment functions
- Per-job escrow isolation (no pooled funds)
- Agent stake requirement (10% of job value)
- Wallet age scoring to prevent wash trading
- Rate limiting (max 3 active jobs per agent)

See [SECURITY.md](docs/SECURITY.md) for full audit notes.

## 🗺️ Roadmap

- [x] Phase 1: Core escrow + reputation (Hackathon)
- [ ] Phase 2: Dispute resolution (ReviewerQueue)
- [ ] Phase 3: Platform token + governance
- [ ] Phase 4: Multi-chain deployment

## 👥 Team

- **Codex** (AI Agent) — Architecture, contracts, frontend
- **Stephen Cheung** (Human) — Product direction, testing, deployment

## 📄 License

MIT
```

Fill in real contract addresses and deployment URL before submission.

### 7. Architecture Documentation (docs/ARCHITECTURE.md)

Write technical architecture doc:
- System diagram (copy from PRD section 5.1)
- Contract interaction flow diagram
- Reputation scoring formula with examples
- Security model overview
- Gas cost table (from P6 gas report)

### 8. API Documentation (docs/API.md)

Write contract API reference:
- For each contract: list all public/external functions
- Parameters, return values, access control
- Events emitted
- Example calls using cast (Foundry CLI)

### 9. Demo Script (docs/DEMO.md)

Write 5-minute demo walkthrough:

```markdown
# Demo Script (5 minutes)

## Setup (30s)
- Open app in browser
- Show landing page
- Connect wallet

## Agent Registration (60s)
- Navigate to agent registration
- Fill profile: "Codex — Smart Contract Specialist"
- Submit transaction
- Show confirmation + agent profile page

## Job Creation (60s)
- Switch to buyer wallet (or second browser)
- Create job: "Smart Contract Review, 0.02 ETH, 24h deadline"
- Submit with ETH
- Show job in jobs list

## Job Acceptance (60s)
- Switch back to agent wallet
- View available jobs
- Accept job (show stake transaction)
- Job status → InProgress

## Deliverable & Payment (90s)
- Agent submits deliverable (upload file to IPFS)
- Show IPFS link
- Switch to buyer
- Confirm delivery
- Show payment release (agent receives 97.5%, treasury 2.5%)
- Show updated reputation score

## Wrap-up (30s)
- Show reputation leaderboard
- Show agent profile with updated stats
- "Reputation earned through work, verified on-chain"
```

### 10. Update Hackathon Conversation Log

Append to PRD.md section 12 (Conversation Log):
```
**2026-03-12+:**
- Multi-phase build architecture designed (8 phases)
- Contracts built and tested (P1-P2, P6)
- Frontend built (P3-P4)
- Integration wired (P5)
- Deployed to Base [Sepolia/Mainnet]
- Documentation complete
- Demo video recorded
```

### 11. Workspace Cleanup

**CRITICAL:** The final workspace must be clean.

```bash
# Remove subagent artifacts
rm -rf projects/agent-work-marketplace/

# Archive phase prompts (no longer needed for execution)
mkdir -p projects/synthesis/archive
mv projects/synthesis/phases/ projects/synthesis/archive/phases/

# Remove any temp files
find projects/synthesis/ -name "*.bak" -delete
find projects/synthesis/ -name "*.tmp" -delete
find projects/synthesis/ -name ".DS_Store" -delete

# Ensure .gitignore exists
cat > projects/synthesis/.gitignore << 'EOF'
# Dependencies
node_modules/
lib/

# Build artifacts
out/
cache/
build/
.svelte-kit/

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
EOF

# Initialize git repo if not exists
cd projects/synthesis
git init
git add .
git commit -m "Agent Work Marketplace - The Synthesis Hackathon Submission"
```

### 12. Final Verification

Run complete verification:

```bash
# Contracts
cd projects/synthesis/contracts
forge build    # Must pass
forge test     # Must pass

# Frontend
cd ../frontend
npm run build  # Must pass

# File structure
cd ..
find . -type f | grep -v node_modules | grep -v .git | grep -v out | grep -v cache | grep -v build | sort
# Verify matches MANIFEST.md target structure
```

## Verification

1. All contracts deployed and verified on BaseScan
2. Frontend deployed and accessible
3. README.md has real contract addresses
4. ARCHITECTURE.md, API.md, SECURITY.md, DEMO.md all exist
5. .gitignore covers all build artifacts
6. No temp files, no duplicate configs
7. Git repo initialized with clean commit
8. MANIFEST.md shows all phases ✅
9. Workspace contains ONLY synthesis project files + standard workspace files

## Completion

Update MANIFEST.md:
- [x] P7: Contracts deployed to Base Sepolia
- [x] P7: Contracts deployed to Base Mainnet (if ready)
- [x] P7: Frontend deployed
- [x] P7: README.md complete with real addresses
- [x] P7: Architecture docs written
- [x] P7: API docs written
- [x] P7: Security docs written
- [x] P7: Demo script written
- [x] P7: Conversation log updated
- [x] P7: Workspace cleaned
- [x] P7: Git repo committed

Report: "BUILD COMPLETE. Agent Work Marketplace deployed and documented."
```

---

## Verification Checklist

- [ ] Deploy.s.sol created with correct deployment order and wiring
- [ ] Contracts deployed to Base Sepolia (testnet)
- [ ] Manual test transaction successful on testnet
- [ ] Contracts deployed to Base Mainnet
- [ ] All contracts verified on BaseScan
- [ ] Frontend contract addresses updated
- [ ] Frontend built and deployed
- [ ] README.md written with real addresses
- [ ] docs/ARCHITECTURE.md written
- [ ] docs/API.md written
- [ ] docs/SECURITY.md exists (from P6)
- [ ] docs/DEMO.md written with 5-minute script
- [ ] PRD.md conversation log updated
- [ ] projects/agent-work-marketplace/ removed
- [ ] Phase prompts archived
- [ ] .gitignore covers all artifacts
- [ ] Git repo initialized and committed
- [ ] MANIFEST.md all phases ✅
- [ ] Workspace clean — only project files remain
