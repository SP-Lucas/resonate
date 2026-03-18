import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, JSON, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Technician(Base):
    __tablename__ = "technicians"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    initials: Mapped[str] = mapped_column(String(10), nullable=False)
    tier: Mapped[int] = mapped_column(nullable=False, default=1)
    skills: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="available")
    shift_start: Mapped[str | None] = mapped_column(String(10), nullable=True)
    shift_end: Mapped[str | None] = mapped_column(String(10), nullable=True)
    tickets_closed_today: Mapped[int] = mapped_column(nullable=False, default=0)
    sla_compliance_rate: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    tickets: Mapped[list["Ticket"]] = relationship("Ticket", back_populates="technician", lazy="select")  # noqa: F821
