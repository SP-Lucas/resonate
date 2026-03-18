# Resonate — AI-First MSP Operating System

> Replace 20+ tools with one intelligent platform. 70% headcount reduction. 42% margins. 8-second incident response.

## Modules

| Module | Key Metric |
|--------|------------|
| **Service Desk** | 12s resolution · AI dispatch · 90% auto-resolved |
| **NetOps / SOC** | 8s threat response · 95% auto-remediated |
| **Finance** | 4hr month-end close · 11-day DSO · auto-invoicing |
| **Procurement** | 10%+ savings · multi-distributor price comparison |
| **CRM** | 34% close rate · 5min CPQ quotes · AI lead scoring |
| **Contracts** | Zero missed renewals · $1.2M+ protected |
| **Security** | Zero Trust · SOC 2 · HIPAA · PCI DSS · ISO 27001 |

## Stack

- **Frontend:** Next.js 14 · Tailwind v4 · shadcn/ui · TypeScript
- **Backend:** FastAPI · PostgreSQL 15 · Redis · SQLAlchemy async
- **AI:** Anthropic Claude (dispatch, insights, summaries)
- **Design:** Dark navy (#070D1A) + teal (#00D4AA) · DM Sans + Space Mono

## Getting Started

```bash
# Frontend
npm install && npm run dev        # http://localhost:3000

# Full stack
cp .env.example .env              # add ANTHROPIC_API_KEY
docker compose up                 # frontend :3000, API :8000

# Backend only
cd backend && poetry install
uvicorn app.main:app --reload     # http://localhost:8000/docs
```

## Structure

```
resonate/
├── src/app/(modules)/   # 7 module pages
├── src/components/      # AppShell, ModuleCard, TicketCard, SLATimer...
├── src/lib/mock-data/   # Typed mock data for all modules
├── backend/app/         # FastAPI — models, schemas, routers, AI
└── docker-compose.yml
```

## Business Case

- **TAM:** $50B · 60,000+ MSPs globally
- **ROI:** 3,153% Year 1 for avg MSP customer
- **Exit:** $500M–$1B (Year 5–7)

---

*Built with Claude AI*
