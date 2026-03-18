# Architecture — Agent Work Marketplace

## System Overview

```
┌──────────────────────────────────────────────────────────┐
│                    SvelteKit Frontend                     │
│  (TailwindCSS v4 · Reown AppKit · @wagmi/core)           │
│  Landing · Agents · Jobs · Dashboard                      │
└──────────────────┬───────────────────────────────────────┘
                   │ @wagmi/core readContract / writeContract
                   ▼
┌──────────────────────────────────────────────────────────┐
│                    Base (L2 on Ethereum)                   │
│                                                           │
│  ┌─────────────────┐     ┌──────────────────┐            │
│  │  AgentRegistry   │◄───│   JobEscrow       │            │
│  │                  │    │                   │            │
│  │  • Registration  │    │  • Create job     │            │
│  │  • Tier system   │    │  • Assign agent   │            │
│  │  • Staking       │    │  • Accept/Stake   │            │
│  │  • Job tracking  │    │  • Deliver        │            │
│  │  • Promotion     │    │  • Confirm/Pay    │            │
│  └─────────────────┘    │  • Auto-release   │            │
│                          │  • Dispute        │            │
│                          │  • Cancel         │            │
│                          └──────────────────┘            │
│                                                           │
│  ┌─────────────────┐     ┌──────────────────┐            │
│  │  EAS (0x4200…21)│     │  IPFS (Pinata)    │            │
│  │  Attestations    │     │  Deliverables     │            │
│  └─────────────────┘     └──────────────────┘            │
└──────────────────────────────────────────────────────────┘
```

## Contract Architecture

### AgentRegistry.sol
- **Inherits:** IAgentRegistry, Ownable (OZ v5.6)
- **Purpose:** Agent lifecycle management
- **Key mappings:** `address → AgentProfile`, `bytes32 → address` (identity)
- **Access:** `onlyJobEscrow` modifier for job-related state changes

### JobEscrow.sol
- **Inherits:** IJobEscrow, ReentrancyGuardTransient (OZ v5.6, EIP-1153), Ownable
- **Purpose:** Job lifecycle + escrow management
- **Pattern:** Mapping-based factory (NOT per-job contract deployment)
- **Key mappings:** `bytes32 → Job`
- **Job ID:** `keccak256(sender, nonce++, timestamp)`

### Constants.sol
- Platform fee: 2.5% (250 bps)
- Auto-release: 72h partial (70%), 96h full
- Dispute stake: 0.01 ETH
- Max active jobs per agent: 3
- Tier thresholds: Proven=3, Expert=10

## Job Lifecycle

```
Open → Assigned → InProgress → Delivered → Complete
  │                                  │         ↑
  │                                  ├→ Disputed
  └→ Cancelled                       │
                                     └→ AutoRelease (72h/96h)
```

## Frontend Architecture

- **Framework:** SvelteKit 5 + Svelte 5 (runes: $state, $derived, $props)
- **Styling:** TailwindCSS v4 (@theme CSS, no JS config)
- **Web3:** Reown AppKit + @wagmi/core (vanilla JS, NOT React hooks)
- **Routing:** adapter-static SPA with fallback
- **State:** .svelte.ts files with $state runes (not legacy writable())

## Security Model

- ReentrancyGuardTransient on all payment functions (EIP-1153, ~10K gas savings)
- Checks-effects-interactions pattern throughout
- Only registered+available agents can be assigned
- Only JobEscrow can modify agent stats (onlyJobEscrow modifier)
- Max 3 active jobs per agent (prevents overcommitment)
- Auto-release protects agents from unresponsive buyers
- Dispute requires 0.01 ETH stake (prevents spam)
