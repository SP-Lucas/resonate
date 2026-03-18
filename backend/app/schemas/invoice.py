import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.client import ClientResponse


class LineItem(BaseModel):
    description: str
    quantity: float
    unit_price: Decimal
    total: Decimal


class InvoiceBase(BaseModel):
    number: str = Field(..., max_length=50)
    client_id: uuid.UUID
    amount: Decimal = Field(..., ge=0)
    status: str = Field(default="draft", pattern="^(draft|sent|paid|overdue)$")
    due_date: date
    line_items: list[dict[str, Any]] = Field(default_factory=list)


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(BaseModel):
    amount: Decimal | None = Field(None, ge=0)
    status: str | None = Field(None, pattern="^(draft|sent|paid|overdue)$")
    due_date: date | None = None
    paid_at: datetime | None = None
    line_items: list[dict[str, Any]] | None = None


class InvoiceResponse(InvoiceBase):
    id: uuid.UUID
    paid_at: datetime | None
    created_at: datetime
    client: ClientResponse | None = None

    model_config = {"from_attributes": True}
