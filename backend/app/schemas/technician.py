import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class TechnicianBase(BaseModel):
    name: str = Field(..., max_length=255)
    email: str = Field(..., max_length=255)
    initials: str = Field(..., max_length=10)
    tier: int = Field(default=1, ge=1, le=3)
    skills: list[str] = Field(default_factory=list)
    status: str = Field(default="available", max_length=50)
    shift_start: str | None = Field(None, max_length=10, description="HH:MM format")
    shift_end: str | None = Field(None, max_length=10, description="HH:MM format")


class TechnicianCreate(TechnicianBase):
    pass


class TechnicianUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    email: str | None = Field(None, max_length=255)
    initials: str | None = Field(None, max_length=10)
    tier: int | None = Field(None, ge=1, le=3)
    skills: list[str] | None = None
    status: str | None = Field(None, max_length=50)
    shift_start: str | None = Field(None, max_length=10)
    shift_end: str | None = Field(None, max_length=10)
    tickets_closed_today: int | None = Field(None, ge=0)
    sla_compliance_rate: float | None = Field(None, ge=0.0, le=1.0)


class TechnicianResponse(TechnicianBase):
    id: uuid.UUID
    tickets_closed_today: int
    sla_compliance_rate: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
