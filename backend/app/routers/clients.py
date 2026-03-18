import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.client import Client
from app.models.ticket import Ticket
from app.schemas.client import ClientCreate, ClientResponse, ClientUpdate
from app.schemas.ticket import TicketResponse

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("", response_model=list[ClientResponse])
async def list_clients(
    tier: str | None = Query(None, description="Filter by client tier"),
    active: bool | None = Query(None, description="Filter by active status (based on health_score > 0)"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> list[Client]:
    query = select(Client)

    if tier is not None:
        query = query.where(Client.tier == tier)
    if active is not None:
        if active:
            query = query.where(Client.health_score > 0)
        else:
            query = query.where(Client.health_score == 0)

    query = query.order_by(Client.name.asc()).offset(offset).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> Client:
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return client


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(payload: ClientCreate, db: AsyncSession = Depends(get_db)) -> Client:
    client = Client(**payload.model_dump())
    db.add(client)
    await db.flush()
    await db.refresh(client)
    return client


@router.patch("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: uuid.UUID,
    payload: ClientUpdate,
    db: AsyncSession = Depends(get_db),
) -> Client:
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(client, field, value)

    await db.flush()
    await db.refresh(client)
    return client


@router.get("/{client_id}/tickets", response_model=list[TicketResponse])
async def get_client_tickets(
    client_id: uuid.UUID,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> list[Ticket]:
    # Verify the client exists first
    client_result = await db.execute(select(Client).where(Client.id == client_id))
    if client_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    query = (
        select(Ticket)
        .where(Ticket.client_id == client_id)
        .order_by(Ticket.priority.asc(), Ticket.created_at.asc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    return list(result.scalars().all())
