import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.client import ClientResponse


class ThreatBase(BaseModel):
    type: str = Field(..., max_length=100)
    severity: str = Field(..., pattern="^(Critical|High|Medium|Low)$")
    source_ip: str | None = Field(None, max_length=45)
    target_client_id: uuid.UUID | None = None
    description: str = Field(default="")
    status: str = Field(default="human_review", max_length=50)


class ThreatCreate(ThreatBase):
    pass


class ThreatUpdate(BaseModel):
    type: str | None = Field(None, max_length=100)
    severity: str | None = Field(None, pattern="^(Critical|High|Medium|Low)$")
    source_ip: str | None = Field(None, max_length=45)
    description: str | None = None
    status: str | None = Field(None, max_length=50)
    auto_remediated: bool | None = None
    remediation_time_seconds: int | None = None
    resolved_at: datetime | None = None


class ThreatResponse(ThreatBase):
    id: uuid.UUID
    auto_remediated: bool
    remediation_time_seconds: int | None
    detected_at: datetime
    resolved_at: datetime | None
    target_client: ClientResponse | None = None

    model_config = {"from_attributes": True}


class ThreatStats(BaseModel):
    threats_today: int
    auto_remediation_pct: float
    avg_response_time_seconds: float | None
    critical_count: int
    high_count: int
