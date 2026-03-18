import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.ticket import TicketStatus
from app.schemas.client import ClientResponse
from app.schemas.technician import TechnicianResponse


class TicketBase(BaseModel):
    number: str = Field(..., max_length=50)
    priority: int = Field(..., ge=1, le=3)
    category: str = Field(..., max_length=100)
    summary: str = Field(..., max_length=500)
    description: str = Field(default="")
    client_id: uuid.UUID
    technician_id: uuid.UUID | None = None
    status: TicketStatus = TicketStatus.open
    sla_deadline: datetime


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    priority: int | None = Field(None, ge=1, le=3)
    category: str | None = Field(None, max_length=100)
    summary: str | None = Field(None, max_length=500)
    description: str | None = None
    technician_id: uuid.UUID | None = None
    status: TicketStatus | None = None
    sla_deadline: datetime | None = None
    auto_remediated: bool | None = None


class TicketResponse(TicketBase):
    id: uuid.UUID
    assigned_at: datetime | None
    auto_remediated: bool
    resolution_time_seconds: int | None
    created_at: datetime
    updated_at: datetime
    client: ClientResponse | None = None
    technician: TechnicianResponse | None = None

    model_config = {"from_attributes": True}


class TicketStats(BaseModel):
    total: int
    p1: int
    p2: int
    p3: int
    at_risk: int
    avg_resolution_seconds: float | None
