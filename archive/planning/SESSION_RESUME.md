# Session Resume — Agent Work Marketplace
**Last updated: 2026-03-21 17:00 HKT**

## Current State

| Item | Status |
|------|--------|
| Contracts | ✅ AgentRegistry + JobEscrow V2, Base Sepolia, verified |
| Frontend | ✅ Live on GH Pages, all pages working |
| On-chain | ✅ 4 agents, 4 jobs on V2 escrow |
| CI/CD | ✅ GH Actions on push to master |
| Docs | ✅ /docs page live, all MD docs updated |
| Demo video | ✅ YouTube: https://youtu.be/nV80iFJucs4 |
| Devfolio | ✅ Published with video + screenshots |
| Deadline | March 22, 11:59 PM PST (March 23, 2:59 PM HKT) |

## Contract Addresses (Base Sepolia)

| Contract | Address |
|----------|---------|
| AgentRegistry | `0x9e295aA55FD61c86cdd08dCa23F90d157eeb2463` |
| JobEscrow V2 | `0xcabf53b4fd6bee5ec3f08de9a2a3d1dbe8854ed4` |
| Owner/Treasury | `0x26e82DAaec170AE16647229161dE398C12d70423` |
| DEPLOY_BLOCK | `39037000n` (registry), `39075840n` (escrow v2) |

## Key URLs

| Item | URL |
|------|-----|
| Frontend | https://ggbossman.github.io/agent-work-marketplace/ |
| GitHub | https://github.com/GGBossman/agent-work-marketplace |
| Devfolio | https://synthesis.devfolio.co/projects/3b80ef7a53c541d8967270d31fb5629b |
| Demo | https://youtu.be/nV80iFJucs4 |
| AgentRegistry (Blockscout) | https://base-sepolia.blockscout.com/address/0x9e295aa55fd61c86cdd08dca23f90d157eeb2463 |
| JobEscrow V2 (Blockscout) | https://base-sepolia.blockscout.com/address/0xcabf53b4fd6bee5ec3f08de9a2a3d1dbe8854ed4 |

## Devfolio Submission

| Field | Value |
|-------|-------|
| Project UUID | `3b80ef7a53c541d8967270d31fb5629b` |
| API Key | `sk-synth-e786d6f5e04441c262969b96b1efa6baecb90d94d6cee2bb` |
| Tracks | Open Track, ERC-8004, Base Agent Services, Escrow Ecosystem |
| ERC-8004 Agent ID | 33755 |

## What Was Built (Session 4 — March 19)

- Fixed all SPA 404s (base path prefix on all hrefs)
- Fixed blank data (RPC switch to publicnode + chunked getLogs)
- Added GH Actions CI/CD
- Created AI agent self-registration skill + CLI
- Built /docs page (buyers, agents, developers, FAQ)
- Added `resolveDispute()` + `claimDeadlineExpiry()` — zero stuck funds
- Deployed JobEscrow V2 with dispute resolution
- Redesigned landing page with live on-chain stats
- Produced demo video (Venice TTS + Playwright + ffmpeg)
- Updated all screenshots and Devfolio submission

## Remaining (Feddas action items)

- [ ] Remove bond.credit track on Devfolio
- [ ] Revoke exposed GitHub PATs at github.com/settings/tokens

## Git Push Pattern

```bash
cd /home/garvis108/.openclaw/workspace/projects/synthesis
git remote set-url origin "https://<NEW_PAT>@github.com/GGBossman/agent-work-marketplace.git"
git add -A && git commit -m "message" && git push origin master
```

## Frontend Deploy

```bash
cd frontend && npm run build && cp build/index.html build/404.html
npx gh-pages -d build --dotfiles -r "https://<PAT>@github.com/GGBossman/agent-work-marketplace.git"
```
