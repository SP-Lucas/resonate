import json
import uuid
from datetime import datetime, timedelta, timezone

import anthropic
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.technician import Technician
from app.models.ticket import Ticket, TicketStatus
from app.models.threat import Threat

router = APIRouter(prefix="/ai", tags=["ai"])


def _get_anthropic_client() -> anthropic.Anthropic:
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Anthropic API key not configured",
        )
    return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


# ── Request / Response schemas ─────────────────────────────────────────────────

class DispatchRequest(BaseModel):
    ticket_id: uuid.UUID


class DispatchResponse(BaseModel):
    technician_id: uuid.UUID | None
    technician_name: str | None
    reason: str
    score: float


class InsightsResponse(BaseModel):
    insights: list[dict]


class SummarizeRequest(BaseModel):
    ticket_id: uuid.UUID


class SummarizeResponse(BaseModel):
    summary: str


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/dispatch", response_model=DispatchResponse)
async def ai_dispatch(payload: DispatchRequest, db: AsyncSession = Depends(get_db)) -> DispatchResponse:
    """Given a ticket ID, use Claude to recommend the best available technician."""
    ticket_result = await db.execute(select(Ticket).where(Ticket.id == payload.ticket_id))
    ticket = ticket_result.scalar_one_or_none()
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    tech_result = await db.execute(
        select(Technician).where(Technician.status == "available")
    )
    technicians = list(tech_result.scalars().all())

    if not technicians:
        return DispatchResponse(
            technician_id=None,
            technician_name=None,
            reason="No available technicians at this time.",
            score=0.0,
        )

    ticket_info = {
        "id": str(ticket.id),
        "number": ticket.number,
        "priority": ticket.priority,
        "category": ticket.category,
        "summary": ticket.summary,
        "description": ticket.description,
        "status": ticket.status.value,
        "sla_deadline": ticket.sla_deadline.isoformat(),
    }

    tech_list = [
        {
            "id": str(t.id),
            "name": t.name,
            "initials": t.initials,
            "tier": t.tier,
            "skills": t.skills,
            "status": t.status,
            "tickets_closed_today": t.tickets_closed_today,
            "sla_compliance_rate": t.sla_compliance_rate,
        }
        for t in technicians
    ]

    prompt = f"""You are an intelligent MSP dispatch system. Given the following support ticket and list of available technicians, select the best match.

TICKET:
{json.dumps(ticket_info, indent=2)}

AVAILABLE TECHNICIANS:
{json.dumps(tech_list, indent=2)}

Selection criteria (in order of importance):
1. Skills matching the ticket category
2. Tier level appropriate to the ticket priority (P1 → Tier 3, P2 → Tier 2+, P3 → any)
3. Current workload (prefer technicians with fewer tickets today)
4. SLA compliance rate (prefer higher performers)

Respond with ONLY a valid JSON object in this exact format:
{{
  "technician_id": "<uuid>",
  "reason": "<one or two sentences explaining the match>",
  "score": <0.0-1.0 confidence score>
}}"""

    client = _get_anthropic_client()
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI returned non-JSON response: {raw[:200]}",
        ) from exc

    matched_tech = next(
        (t for t in technicians if str(t.id) == data.get("technician_id")), None
    )

    return DispatchResponse(
        technician_id=matched_tech.id if matched_tech else None,
        technician_name=matched_tech.name if matched_tech else None,
        reason=data.get("reason", ""),
        score=float(data.get("score", 0.0)),
    )


@router.post("/insights", response_model=InsightsResponse)
async def ai_insights(db: AsyncSession = Depends(get_db)) -> InsightsResponse:
    """Generate platform-wide operational insights using Claude."""
    since = datetime.now(timezone.utc) - timedelta(hours=24)

    tickets_result = await db.execute(
        select(Ticket).where(Ticket.created_at >= since)
    )
    recent_tickets = list(tickets_result.scalars().all())

    threats_result = await db.execute(
        select(Threat).where(Threat.detected_at >= since)
    )
    recent_threats = list(threats_result.scalars().all())

    open_tickets = [t for t in recent_tickets if t.status != TicketStatus.resolved]
    at_risk = [t for t in open_tickets if t.sla_deadline <= datetime.now(timezone.utc)]

    resolved = [t for t in recent_tickets if t.resolution_time_seconds is not None]
    avg_res = (
        sum(t.resolution_time_seconds for t in resolved) / len(resolved) if resolved else None
    )

    auto_remediated_threats = [t for t in recent_threats if t.auto_remediated]

    context = {
        "period": "last 24 hours",
        "tickets": {
            "total_new": len(recent_tickets),
            "open": len(open_tickets),
            "at_risk_sla": len(at_risk),
            "avg_resolution_seconds": avg_res,
            "by_priority": {
                "p1": sum(1 for t in open_tickets if t.priority == 1),
                "p2": sum(1 for t in open_tickets if t.priority == 2),
                "p3": sum(1 for t in open_tickets if t.priority == 3),
            },
        },
        "threats": {
            "total": len(recent_threats),
            "auto_remediated": len(auto_remediated_threats),
            "auto_remediation_rate": (
                len(auto_remediated_threats) / len(recent_threats)
                if recent_threats
                else 0
            ),
            "by_severity": {
                "critical": sum(1 for t in recent_threats if t.severity == "Critical"),
                "high": sum(1 for t in recent_threats if t.severity == "High"),
                "medium": sum(1 for t in recent_threats if t.severity == "Medium"),
                "low": sum(1 for t in recent_threats if t.severity == "Low"),
            },
        },
    }

    prompt = f"""You are an AI operations analyst for a managed service provider (MSP). Analyze the following platform metrics and generate actionable insights.

METRICS (last 24 hours):
{json.dumps(context, indent=2)}

Generate 3-5 insights. Each insight should be specific, actionable, and relevant to MSP operations. Vary the severity levels.

Respond with ONLY a valid JSON array in this exact format:
[
  {{
    "title": "<short title>",
    "description": "<2-3 sentence insight with specific numbers and actionable recommendation>",
    "severity": "critical|warning|info|success",
    "confidence": <0.0-1.0>,
    "category": "tickets|security|performance|capacity|compliance"
  }}
]"""

    client = _get_anthropic_client()
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        insights = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI returned non-JSON response: {raw[:200]}",
        ) from exc

    return InsightsResponse(insights=insights if isinstance(insights, list) else [])


@router.post("/summarize-ticket", response_model=SummarizeResponse)
async def summarize_ticket(
    payload: SummarizeRequest, db: AsyncSession = Depends(get_db)
) -> SummarizeResponse:
    """Generate an AI summary of a ticket's details and history."""
    ticket_result = await db.execute(select(Ticket).where(Ticket.id == payload.ticket_id))
    ticket = ticket_result.scalar_one_or_none()
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    ticket_data = {
        "number": ticket.number,
        "priority": ticket.priority,
        "category": ticket.category,
        "summary": ticket.summary,
        "description": ticket.description,
        "status": ticket.status.value,
        "client_id": str(ticket.client_id),
        "technician_id": str(ticket.technician_id) if ticket.technician_id else None,
        "created_at": ticket.created_at.isoformat(),
        "sla_deadline": ticket.sla_deadline.isoformat(),
        "auto_remediated": ticket.auto_remediated,
        "resolution_time_seconds": ticket.resolution_time_seconds,
    }

    prompt = f"""You are a technical writer for an MSP. Provide a concise, professional summary of the following support ticket. Include: the core issue, current status, any notable details about priority or SLA, and recommended next steps if still open.

TICKET DATA:
{json.dumps(ticket_data, indent=2)}

Write a clear 2-4 sentence summary. Do not include JSON, just plain prose."""

    client = _get_anthropic_client()
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=256,
        messages=[{"role": "user", "content": prompt}],
    )

    return SummarizeResponse(summary=message.content[0].text.strip())
