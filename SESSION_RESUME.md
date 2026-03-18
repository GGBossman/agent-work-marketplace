# Session Resume Prompt — Agent Work Marketplace
**Read this first. Then execute.**

## Context
You are Codex, CTO and co-founder of Agent Work Marketplace for The Synthesis hackathon.
**Deadline: March 22, 11:59 PM PST (March 23, 2:59 PM HKT). ~4 days left.**

## Read These Files (in order)
1. `projects/synthesis/MANIFEST.md` — source of truth
2. `projects/synthesis/AUDIT_REPORT.md` — known issues
3. `projects/synthesis/TODO_WIN.md` — full task list

## Current State (as of 2026-03-19 00:31 HKT)

### ✅ DONE
- Full codebase: 2 Solidity contracts, SvelteKit 5 frontend, 41/41 Foundry tests
- Frontend wired to real contracts (USE_MOCK=false), event-based reads, proper stake calculations
- Deployed: Base Sepolia (AgentRegistry: 0x9e295aA55FD61c86cdd08dCa23F90d157eeb2463, JobEscrow: 0xC6Ea67272757D9Fd1229293916b3030da87E3aB6)
- GitHub: https://github.com/GGBossman/agent-work-marketplace (master up to date)
- GH Pages: https://ggbossman.github.io/agent-work-marketplace/ (live, WalletConnect ID wired)
- DevSpot Agent Manifest: agent.json + agent_log.json in repo
- Devfolio: published, 5 tracks, metadata updated
- Demo data on-chain: 3 completed jobs, agent promoted to Proven tier
- ERC-8004 agent #33755 self-custodied

### 🔴 REMAINING (Priority Order)

#### 1. Browser-test the live frontend
- Open https://ggbossman.github.io/agent-work-marketplace/ in the browser tool
- Verify: landing page renders, wallet connect works, agents page shows on-chain data, jobs page shows 3 completed jobs
- If broken: debug and fix, rebuild, redeploy

#### 2. Take screenshots for Devfolio
- Screenshot the landing page, agents page, jobs page, job detail page, dashboard
- These become the cover image and pictures on Devfolio

#### 3. Demo video (5 min)
- Record or script a demo walkthrough per docs/DEMO.md
- Upload to YouTube/Loom, update Devfolio videoURL
- This is the #1 thing judges weight after working code

#### 4. Update Devfolio submission
```bash
curl -X POST "https://synthesis.devfolio.co/projects/3b80ef7a53c541d8967270d31fb5629b" \
  -H "Authorization: Bearer sk-synth-e786d6f5e04441c262969b96b1efa6baecb90d94d6cee2bb" \
  -H "Content-Type: application/json" \
  -d '{"videoURL": "<url>", "coverImageURL": "<url>", "pictures": "<url>"}'
```

#### 5. Create a few more open jobs
- So the Jobs page has some open listings for judges to see
- Use cast with the .env at /home/garvis108/.openclaw/workspace/projects/synthesis/.env

#### 6. Drop bond.credit track
- We don't have live GMX trading. Withdraw to avoid negative judge impression.

### Key Credentials (saved in TOOLS.md)
- GitHub PAT: in TOOLS.md
- WalletConnect Project ID: e36fd23d3df06e153a4f475eb1fbcae3
- Devfolio API: sk-synth-e786d6f5e04441c262969b96b1efa6baecb90d94d6cee2bb
- Private key .env: /home/garvis108/.openclaw/workspace/projects/synthesis/.env (DO NOT DELETE OR UPLOAD)
- Owner wallet: 0x26e82DAaec170AE16647229161dE398C12d70423

### Git Push Pattern
```bash
cd /home/garvis108/.openclaw/workspace-codex/projects/synthesis
git remote set-url origin https://<TOKEN_FROM_TOOLS.MD>@github.com/GGBossman/agent-work-marketplace.git
git push origin master
git remote set-url origin https://github.com/GGBossman/agent-work-marketplace.git
```

### GH Pages Deploy Pattern
```bash
cd projects/synthesis/frontend && npm install && npm run build
# Then create orphan branch with build output, force-push to gh-pages
```

### Contract Interaction Pattern
```bash
export PATH="$HOME/.foundry/bin:$PATH"
source /home/garvis108/.openclaw/workspace/projects/synthesis/.env
cast send <CONTRACT> "<function>" <args> --private-key $PRIVATE_KEY --rpc-url https://sepolia.base.org
```

## Winning Strategy
- Self-referential thesis: AI agent built the marketplace for AI agents
- 41/41 first-pass tests, Proven tier on-chain, full lifecycle demonstrated
- ReentrancyGuardTransient (EIP-1153), clean OZ v5.6 patterns
- ERC-8004 track is strongest fit ($8K prize)
- Demo video is the biggest remaining differentiator
