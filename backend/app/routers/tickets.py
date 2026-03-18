import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.ticket import Ticket, TicketStatus
from app.schemas.ticket import TicketCreate, TicketResponse, TicketStats, TicketUpdate

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("/stats", response_model=TicketStats)
async def get_ticket_stats(db: AsyncSession = Depends(get_db)) -> TicketStats:
    now = datetime.now(timezone.utc)

    total_result = await db.execute(select(func.count(Ticket.id)))
    total = total_result.scalar_one()

    p1_result = await db.execute(
        select(func.count(Ticket.id)).where(
            Ticket.priority == 1, Ticket.status != TicketStatus.resolved
        )
    )
    p1 = p1_result.scalar_one()

    p2_result = await db.execute(
        select(func.count(Ticket.id)).where(
            Ticket.priority == 2, Ticket.status != TicketStatus.resolved
        )
    )
    p2 = p2_result.scalar_one()

    p3_result = await db.execute(
        select(func.count(Ticket.id)).where(
            Ticket.priority == 3, Ticket.status != TicketStatus.resolved
        )
    )
    p3 = p3_result.scalar_one()

    at_risk_result = await db.execute(
        select(func.count(Ticket.id)).where(
            Ticket.sla_deadline <= now,
            Ticket.status != TicketStatus.resolved,
        )
    )
    at_risk = at_risk_result.scalar_one()

    avg_result = await db.execute(
        select(func.avg(Ticket.resolution_time_seconds)).where(
            Ticket.resolution_time_seconds.isnot(None)
        )
    )
    avg_resolution = avg_result.scalar_one()

    return TicketStats(
        total=total,
        p1=p1,
        p2=p2,
        p3=p3,
        at_risk=at_risk,
        avg_resolution_seconds=float(avg_resolution) if avg_resolution is not None else None,
    )


@router.get("", response_model=list[TicketResponse])
async def list_tickets(
    status: TicketStatus | None = Query(None),
    priority: int | None = Query(None, ge=1, le=3),
    client_id: uuid.UUID | None = Query(None),
    technician_id: uuid.UUID | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> list[Ticket]:
    query = select(Ticket)

    if status is not None:
        query = query.where(Ticket.status == status)
    if priority is not None:
        query = query.where(Ticket.priority == priority)
    if client_id is not None:
        query = query.where(Ticket.client_id == client_id)
    if technician_id is not None:
        query = query.where(Ticket.technician_id == technician_id)

    query = query.order_by(Ticket.priority.asc(), Ticket.created_at.asc()).offset(offset).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> Ticket:
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(payload: TicketCreate, db: AsyncSession = Depends(get_db)) -> Ticket:
    # Verify number uniqueness
    existing = await db.execute(select(Ticket).where(Ticket.number == payload.number))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"Ticket number '{payload.number}' already exists"
        )

    ticket = Ticket(**payload.model_dump())
    if ticket.technician_id is not None:
        ticket.assigned_at = datetime.now(timezone.utc)

    db.add(ticket)
    await db.flush()
    await db.refresh(ticket)
    return ticket


@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: uuid.UUID, payload: TicketUpdate, db: AsyncSession = Depends(get_db)
) -> Ticket:
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Track assignment timestamp
    if "technician_id" in update_data and update_data["technician_id"] is not None:
        if ticket.technician_id is None:
            ticket.assigned_at = datetime.now(timezone.utc)

    for field, value in update_data.items():
        setattr(ticket, field, value)

    await db.flush()
    await db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/complete", response_model=TicketResponse)
async def complete_ticket(ticket_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> Ticket:
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if ticket.status == TicketStatus.resolved:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ticket is already resolved")

    now = datetime.now(timezone.utc)
    ticket.status = TicketStatus.resolved

    # Calculate resolution time from creation
    created_naive = ticket.created_at
    if created_naive.tzinfo is None:
        created_naive = created_naive.replace(tzinfo=timezone.utc)
    ticket.resolution_time_seconds = int((now - created_naive).total_seconds())

    await db.flush()
    await db.refresh(ticket)
    return ticket
