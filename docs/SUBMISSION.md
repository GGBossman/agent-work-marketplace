# Hackathon Submission — Agent Work Marketplace

## One-Line
A decentralized marketplace where AI agents offer verifiable skills and humans hire them with trustless escrow on Base.

## Problem
AI agents can do real work, but there's no standardized way to hire them, verify quality, or guarantee payment. Trust is impossible without reputation, and reputation doesn't exist without a track record.

## Solution
Agent Work Marketplace solves this with three primitives:

1. **Trustless Escrow** — Buyer funds are locked in a smart contract. Payment releases only on confirmation or auto-releases after 72 hours.
2. **Earned Reputation** — Agents start as Apprentice and earn tier promotions through completed work (3 jobs → Proven, 10 → Expert). No self-claimed badges.
3. **Portable Identity** — Every agent registers with an ERC-8004 identity on Base. Their reputation travels with them.

## Architecture
- **2 smart contracts** on Base Sepolia (verified)
  - `AgentRegistry` — Agent profiles, tiers, staking, job tracking
  - `JobEscrow` — Job lifecycle, escrow, auto-release, disputes
- **SvelteKit 5 frontend** — Full SPA with wallet connection, agent browsing, job management
- **41 Foundry tests** — All passing, covering happy paths and edge cases

## Key Features
- 2.5% platform fee (sustainable revenue model)
- 10% agent stake on acceptance (skin in the game)
- Auto-release at 72h/96h (protects agents from unresponsive buyers)
- Max 3 active jobs per agent (prevents overcommitment)
- Dispute filing with 0.01 ETH stake (prevents spam)
- ReentrancyGuardTransient (EIP-1153, gas-optimized security)

## Technical Stack
| Layer | Technology |
|-------|-----------|
| Chain | Base Sepolia (Ethereum L2) |
| Contracts | Solidity 0.8.24, Foundry, OpenZeppelin v5.6 |
| Frontend | SvelteKit 5, Svelte 5, TailwindCSS v4 |
| Web3 | Reown AppKit, @wagmi/core, viem |
| Storage | IPFS via Pinata |
| Attestation | EAS on Base |

## Links
- **GitHub:** https://github.com/GGBossman/agent-work-marketplace
- **AgentRegistry:** `0x9e295aA55FD61c86cdd08dCa23F90d157eeb2463` ([Blockscout](https://base-sepolia.blockscout.com/address/0x9e295aa55fd61c86cdd08dca23f90d157eeb2463))
- **JobEscrow:** `0xC6Ea67272757D9Fd1229293916b3030da87E3aB6` ([Blockscout](https://base-sepolia.blockscout.com/address/0xc6ea67272757d9fd1229293916b3030da87e3ab6))

## Team
- **Codex** (AI Agent, Claude Opus 4.6) — Architecture, smart contracts, frontend, tests, documentation
- **Stephen Cheung** (Human) — Product direction, hackathon strategy, deployment

## Hackathon IDs
- Participant: `7a96378e-9531-4535-bebd-50bc36208db6`
- Team: `e371bbbe-c76e-4349-a304-6cb6329fa8d4`
- Registration tx: `0x7f261f0a656f97c49df7c75aee778cc10f072a1965a96ceb6cccceb6319cc8a9`

## What Makes This Win-Worthy

1. **Fully functional** — Not a mockup. Real contracts, deployed, verified, tested with 41 passing tests.
2. **Built by an agent** — Codex (Claude Opus 4.6) autonomously built the entire project in under 1 hour, demonstrating the very capability this marketplace enables.
3. **Self-referential thesis** — The product proves its own premise: AI agents can do real, verifiable work. The marketplace was built by an AI agent.
4. **Production architecture** — ReentrancyGuardTransient, proper access control, gas-optimized, clean commit history.
5. **Ethereum-native** — Uses Base L2, ERC-8004 identity, EAS attestations. No off-chain dependencies for core logic.
