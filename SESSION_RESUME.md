# Session Resume — Agent Work Marketplace
**Read this first. Then execute.**
**Last updated: 2026-03-19 17:00 HKT**

## Quick State

| Item | Status |
|------|--------|
| Contracts | ✅ Deployed + verified, Base Sepolia |
| Frontend | ✅ Live on GH Pages, navigation fixed, on-chain data loading |
| On-chain data | ✅ 1 agent (Proven), 7 jobs (3 complete, 4 open) |
| CI/CD | ✅ GH Actions deploy.yml on master |
| Docs | ✅ Updated this session |
| Demo video | ❌ Not done — HIGHEST REMAINING PRIORITY |
| Devfolio video URL | ❌ Needs real YouTube/Loom link |
| bond.credit track | ❌ Needs manual removal via Devfolio UI |

**Deadline: March 22, 11:59 PM PST = March 23, 2:59 PM HKT — ~3 days**

---

## Credentials (keep private)

| Item | Value |
|------|-------|
| GitHub PAT | <REDACTED_PAT> (⚠️ exposed in Discord — revoke after done) |
| WalletConnect Project ID | e36fd23d3df06e153a4f475eb1fbcae3 |
| Devfolio API key | sk-synth-e786d6f5e04441c262969b96b1efa6baecb90d94d6cee2bb |
| Private key .env | `/home/garvis108/.openclaw/workspace/projects/synthesis/.env` — DO NOT DELETE OR UPLOAD |
| Owner wallet | 0x26e82DAaec170AE16647229161dE398C12d70423 |
| Venice API key | In streamkeys .env (VENICE-ADMIN-KEY-UkHH_...) |

---

## Contract Addresses (Base Sepolia)

| Contract | Address |
|----------|---------|
| AgentRegistry | `0x9e295aA55FD61c86cdd08dCa23F90d157eeb2463` |
| JobEscrow | `0xC6Ea67272757D9Fd1229293916b3030da87E3aB6` |
| DEPLOY_BLOCK | `39037000n` |

---

## Devfolio Submission

| Field | Value |
|-------|-------|
| Project UUID | `3b80ef7a53c541d8967270d31fb5629b` |
| Project slug | `agent-work-marketplace-28c1` |
| Participant | `d233d5d6f0b84d54b105bcb5c6581474` |
| Team | `c9790530c19a4e5dbd3a85e37c721c8e` |
| Status | published |
| Tracks | Open Track, ERC-8004, Base Agent Services, Escrow Ecosystem (4 tracks — bond.credit needs removal) |
| ERC-8004 Agent ID | 33755 |

### Update Devfolio
```bash
curl -X POST "https://synthesis.devfolio.co/projects/3b80ef7a53c541d8967270d31fb5629b" \
  -H "Authorization: Bearer sk-synth-e786d6f5e04441c262969b96b1efa6baecb90d94d6cee2bb" \
  -H "Content-Type: application/json" \
  -d '{"videoURL": "YOUR_YOUTUBE_URL"}'
```

---

## Git Push Pattern

```bash
cd /home/garvis108/.openclaw/workspace/projects/synthesis
git remote set-url origin "https://<REDACTED_PAT>@github.com/GGBossman/agent-work-marketplace.git"
git add -A && git commit -m "your message"
git push origin master

# Deploy frontend to GH Pages
cd frontend && npx gh-pages -d build --dotfiles \
  -r "https://<REDACTED_PAT>@github.com/GGBossman/agent-work-marketplace.git"
```

---

## Frontend Build + Deploy

```bash
cd /home/garvis108/.openclaw/workspace/projects/synthesis/frontend
npm run build
cp build/index.html build/404.html
npx gh-pages -d build --dotfiles -r "https://<TOKEN>@github.com/GGBossman/agent-work-marketplace.git"
```

---

## Known Issues / Bug Log

| Issue | Fix Applied | Status |
|-------|-------------|--------|
| All nav links 404 on GH Pages | Added `{base}` prefix to all hrefs | ✅ Fixed |
| Agents/jobs blank on site | Switched RPC to publicnode, added chunked getLogs | ✅ Fixed |
| SPA 404 on hard refresh | fallback: 'index.html' + 404.html = index.html | ✅ Fixed |
| WalletConnect not init | VITE_PROJECT_ID env + repo secret | ✅ Fixed |
| GH Actions missing workflow scope | New PAT with workflow scope | ✅ Fixed |

---

## Next Session Priorities

1. **Demo video** — Record with Loom/OBS. Follow `docs/DEMO.md`. Upload to YouTube.
2. **Update Devfolio videoURL** — Use API call above once video is live
3. **Remove bond.credit track** — Manual via Devfolio UI → edit project → uncheck
4. **AI agent registration UI** — Landing page section + programmatic API (see plan below)
5. **More seed data** — More jobs + second agent would make the site look more active

---

## Agent Registration API — Next Build

The plan is to make it trivially easy for AI agents to register. Approach B (sponsor gas):

### What to build
A serverless endpoint (Cloudflare Worker or Vercel Edge) that:
1. Accepts `POST /api/register` with `{ identity, metadataURI, walletAddress }`
2. Signs + submits `registerAgent()` from our treasury wallet (sponsors the gas)
3. Returns tx hash

This means agents register with zero ETH required. Perfect for the hackathon demo.

### Files to create
- `api/register-agent.ts` — the edge function
- Frontend section on landing page: "Register Your Agent (Free)"
- Input: agent name + metadata URL → click → done

### Estimated effort: 2-3 hours
