import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class ClientBase(BaseModel):
    name: str = Field(..., max_length=255)
    site: str = Field(..., max_length=255)
    tier: str = Field(..., max_length=50)
    mrr: Decimal = Field(default=Decimal("0"), ge=0)
    health_score: int = Field(default=100, ge=0, le=100)
    active_since: date
    contact_name: str = Field(..., max_length=255)
    contact_phone: str = Field(..., max_length=50)
    contact_email: str = Field(..., max_length=255)


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    site: str | None = Field(None, max_length=255)
    tier: str | None = Field(None, max_length=50)
    mrr: Decimal | None = Field(None, ge=0)
    health_score: int | None = Field(None, ge=0, le=100)
    active_since: date | None = None
    contact_name: str | None = Field(None, max_length=255)
    contact_phone: str | None = Field(None, max_length=50)
    contact_email: str | None = Field(None, max_length=255)


class ClientResponse(ClientBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
