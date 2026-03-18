import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    site: Mapped[str] = mapped_column(String(255), nullable=False)
    tier: Mapped[str] = mapped_column(String(50), nullable=False)
    mrr: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0"))
    health_score: Mapped[int] = mapped_column(nullable=False, default=100)
    active_since: Mapped[date] = mapped_column(Date, nullable=False)
    contact_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    tickets: Mapped[list["Ticket"]] = relationship("Ticket", back_populates="client", lazy="select")  # noqa: F821
    threats: Mapped[list["Threat"]] = relationship("Threat", back_populates="target_client", lazy="select")  # noqa: F821
    invoices: Mapped[list["Invoice"]] = relationship("Invoice", back_populates="client", lazy="select")  # noqa: F821
    contracts: Mapped[list["Contract"]] = relationship("Contract", back_populates="client", lazy="select")  # noqa: F821
