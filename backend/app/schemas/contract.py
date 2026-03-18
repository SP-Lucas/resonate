import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.client import ClientResponse


class ContractBase(BaseModel):
    client_id: uuid.UUID
    type: str = Field(..., pattern="^(MSA|SLA|PSA|Addendum|NDA)$")
    title: str = Field(..., max_length=255)
    value_monthly: Decimal = Field(default=Decimal("0"), ge=0)
    start_date: date
    end_date: date
    auto_renew: bool = False
    status: str = Field(default="active", max_length=50)
    health_score: int = Field(default=100, ge=0, le=100)


class ContractCreate(ContractBase):
    pass


class ContractUpdate(BaseModel):
    type: str | None = Field(None, pattern="^(MSA|SLA|PSA|Addendum|NDA)$")
    title: str | None = Field(None, max_length=255)
    value_monthly: Decimal | None = Field(None, ge=0)
    start_date: date | None = None
    end_date: date | None = None
    auto_renew: bool | None = None
    status: str | None = Field(None, max_length=50)
    health_score: int | None = Field(None, ge=0, le=100)


class ContractResponse(ContractBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    client: ClientResponse | None = None

    model_config = {"from_attributes": True}
