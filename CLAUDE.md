# Resonate — AI-First MSP Operating Platform

## What This Is
Full replacement for 20+ MSP tools (ConnectWise, Autotask, etc.) — unified platform with AI-native workflows. VC pitch doc lives at `~/nanoclaw/RZ.md`.

## GitHub
- Repo: `SP-Lucas/resonate` (public)
- Working dir: `~/resonate-build`
- Push with: `git push origin main`

## Stack
- **Frontend:** Next.js 14 (App Router), Tailwind v4, shadcn/ui, TypeScript
- **Backend:** FastAPI + PostgreSQL + Redis (Docker Compose)
- **Design:** Dark `#070D1A` navy, teal `#14B8A6` accent, `DM Sans` / `Space Mono`

## Current State (as of 2026-03-18)

### Built & committed
| Module | Status |
|--------|--------|
| Service Desk | Full ticket queue, SLA timers, priority filters, tech assign sheet |
| Finance | KPIs, license table, AR aging, animated count-ups |
| Procurement | Animated page |
| CRM | Animated page |
| Contracts | Animated page |
| NetOps | Animated page |
| Security | Animated page |
| Auth | Login page, AuthProvider, JWT flow wired |
| AppShell | Sidebar nav, user dropdown, responsive |
| Executive Dashboard | ModuleCard grid, AIInsight component |

### Still needed (priority order)
1. **Service Desk** — bulk actions, AI triage panel, email-to-ticket
2. **NetOps/SOC** — live device map, alert feed, ping/trace tools
3. **CRM** — contact list, deal pipeline (kanban), account detail view
4. **Contracts** — contract list, renewal alerts, e-sign flow
5. **Finance** — invoice gen, AP/AR drill-down, budget vs actual charts
6. **Procurement** — PO workflow, vendor catalog, approval chain
7. **Security** — vulnerability feed, patch status, compliance matrix
8. **Backend API** — wire FastAPI routes to frontend (currently all mock data)
9. **Real-time** — WebSocket feeds for alerts/SLA timers
10. **AI features** — Claude integration for triage, summaries, anomaly detection

## Running Locally
```bash
# Frontend
npm run dev        # http://localhost:3000

# Backend (requires Docker)
docker-compose up  # API on :8000, Postgres :5432, Redis :6379
```

## Key Files
| Path | Purpose |
|------|---------|
| `src/app/(modules)/` | Module pages |
| `src/components/layout/AppShell.tsx` | Main shell with sidebar |
| `src/components/dashboard/` | Dashboard widgets |
| `src/components/ui/` | shadcn components |
| `src/lib/mock-data/` | Mock data per module |
| `src/lib/api-client.ts` | Frontend API client |
| `backend/app/` | FastAPI app |
| `docker-compose.yml` | Full stack orchestration |

## Design Tokens
```css
--background: #070D1A   /* deep navy */
--card: #0D1526         /* card surface */
--border: #1E2D45       /* borders */
--primary: #14B8A6      /* teal accent */
--text: #E2E8F0         /* primary text */
--muted: #64748B        /* muted text */
```

## Instructions for Claude
- Continue building from the "Still needed" list above, priority order
- All new pages should match the animated style of Finance/Procurement pages
- Use mock data from `src/lib/mock-data/` — create new files there for new modules
- Commit frequently with descriptive messages
- When in doubt, refer to existing modules (service-desk is most complete) as the pattern
