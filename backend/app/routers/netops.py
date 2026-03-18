import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.threat import Threat
from app.schemas.threat import ThreatResponse, ThreatStats

router = APIRouter(prefix="/netops", tags=["netops"])

# Compliance frameworks with placeholder per-client scores
# In a real deployment these would be computed from audit data
COMPLIANCE_FRAMEWORKS = ["SOC2", "ISO27001", "NIST", "CIS", "HIPAA"]


@router.get("/threats", response_model=list[ThreatResponse])
async def list_threats(
    severity: str | None = Query(None, pattern="^(Critical|High|Medium|Low)$"),
    status: str | None = Query(None),
    client_id: uuid.UUID | None = Query(None),
    hours: int = Query(24, ge=1, le=168, description="Look-back window in hours"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> list[Threat]:
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = select(Threat).where(Threat.detected_at >= since)

    if severity is not None:
        query = query.where(Threat.severity == severity)
    if status is not None:
        query = query.where(Threat.status == status)
    if client_id is not None:
        query = query.where(Threat.target_client_id == client_id)

    query = query.order_by(Threat.detected_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/stats", response_model=ThreatStats)
async def get_threat_stats(db: AsyncSession = Depends(get_db)) -> ThreatStats:
    since = datetime.now(timezone.utc) - timedelta(hours=24)

    total_result = await db.execute(
        select(func.count(Threat.id)).where(Threat.detected_at >= since)
    )
    threats_today = total_result.scalar_one()

    auto_result = await db.execute(
        select(func.count(Threat.id)).where(
            Threat.detected_at >= since, Threat.auto_remediated == True  # noqa: E712
        )
    )
    auto_count = auto_result.scalar_one()

    avg_result = await db.execute(
        select(func.avg(Threat.remediation_time_seconds)).where(
            Threat.detected_at >= since,
            Threat.remediation_time_seconds.isnot(None),
        )
    )
    avg_response = avg_result.scalar_one()

    critical_result = await db.execute(
        select(func.count(Threat.id)).where(
            Threat.detected_at >= since, Threat.severity == "Critical"
        )
    )
    critical_count = critical_result.scalar_one()

    high_result = await db.execute(
        select(func.count(Threat.id)).where(
            Threat.detected_at >= since, Threat.severity == "High"
        )
    )
    high_count = high_result.scalar_one()

    return ThreatStats(
        threats_today=threats_today,
        auto_remediation_pct=(auto_count / threats_today * 100) if threats_today > 0 else 0.0,
        avg_response_time_seconds=float(avg_response) if avg_response is not None else None,
        critical_count=critical_count,
        high_count=high_count,
    )


@router.get("/compliance")
async def get_compliance(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Returns compliance scores per framework per client.
    Scores are derived from threat history and remediation performance.
    In production these would integrate with a dedicated compliance engine.
    """
    from app.models.client import Client  # avoid circular at module level

    clients_result = await db.execute(select(Client))
    clients = list(clients_result.scalars().all())

    since = datetime.now(timezone.utc) - timedelta(days=30)

    compliance_data = []
    for client in clients:
        # Fetch client's recent threat metrics
        threat_result = await db.execute(
            select(Threat).where(
                Threat.target_client_id == client.id,
                Threat.detected_at >= since,
            )
        )
        threats = list(threat_result.scalars().all())

        total = len(threats)
        remediated = sum(1 for t in threats if t.auto_remediated or t.status == "resolved")
        remediation_rate = (remediated / total) if total > 0 else 1.0

        # Base score influenced by health_score and remediation rate
        base = (client.health_score / 100) * 0.6 + remediation_rate * 0.4

        frameworks = {}
        for fw in COMPLIANCE_FRAMEWORKS:
            # Slight per-framework variance using deterministic offset from client id
            offset = (hash(f"{client.id}{fw}") % 10 - 5) / 100
            frameworks[fw] = min(100, max(0, round((base + offset) * 100)))

        compliance_data.append(
            {
                "client_id": str(client.id),
                "client_name": client.name,
                "tier": client.tier,
                "frameworks": frameworks,
                "overall": round(sum(frameworks.values()) / len(frameworks)),
            }
        )

    return {"compliance": compliance_data, "period_days": 30}


@router.post("/threats/{threat_id}/remediate", response_model=ThreatResponse)
async def remediate_threat(
    threat_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> Threat:
    """Trigger auto-remediation for a specific threat."""
    result = await db.execute(select(Threat).where(Threat.id == threat_id))
    threat = result.scalar_one_or_none()
    if threat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threat not found")

    if threat.status in ("auto_remediated", "resolved"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Threat is already in status '{threat.status}'",
        )

    now = datetime.now(timezone.utc)
    detected = threat.detected_at
    if detected.tzinfo is None:
        detected = detected.replace(tzinfo=timezone.utc)

    threat.auto_remediated = True
    threat.status = "auto_remediated"
    threat.resolved_at = now
    threat.remediation_time_seconds = int((now - detected).total_seconds())

    await db.flush()
    await db.refresh(threat)
    return threat
