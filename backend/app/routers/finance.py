from datetime import date, datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceResponse

router = APIRouter(prefix="/finance", tags=["finance"])


# ── Response schemas ────────────────────────────────────────────────────────────


class FinanceStats(BaseModel):
    mrr: Decimal
    arr: Decimal
    total_ar: Decimal  # sum of unpaid invoice amounts
    dso: float | None  # Days Sales Outstanding
    gross_margin: float | None  # placeholder — requires cost data


class ARAgingBucket(BaseModel):
    label: str
    min_days: int
    max_days: int | None  # None means open-ended (90+)
    count: int
    total: Decimal


class ARAgingResponse(BaseModel):
    buckets: list[ARAgingBucket]
    as_of: date


# ── Helpers ─────────────────────────────────────────────────────────────────────


def _days_outstanding(invoice: Invoice, today: date) -> int:
    """Number of days since an invoice's due date (negative if not yet due)."""
    return (today - invoice.due_date).days


# ── Endpoints ──────────────────────────────────────────────────────────────────


@router.get("/stats", response_model=FinanceStats)
async def get_finance_stats(db: AsyncSession = Depends(get_db)) -> FinanceStats:
    """
    Compute headline financial KPIs from the invoices table.

    MRR  — sum of paid invoice amounts in the current calendar month.
    ARR  — MRR × 12.
    AR   — sum of amounts for all sent/overdue invoices (not yet paid).
    DSO  — (total AR / total revenue in last 30 days) × 30, if revenue > 0.
    Gross margin is returned as None because cost data is not tracked here.
    """
    now = datetime.now(timezone.utc)
    today = now.date()
    month_start = today.replace(day=1)

    # MRR: paid invoices with paid_at in the current calendar month
    mrr_result = await db.execute(
        select(func.coalesce(func.sum(Invoice.amount), 0)).where(
            Invoice.status == "paid",
            Invoice.paid_at >= datetime(today.year, today.month, 1, tzinfo=timezone.utc),
        )
    )
    mrr = Decimal(str(mrr_result.scalar_one() or 0))

    # Total AR: amounts on sent + overdue invoices
    ar_result = await db.execute(
        select(func.coalesce(func.sum(Invoice.amount), 0)).where(
            Invoice.status.in_(["sent", "overdue"])
        )
    )
    total_ar = Decimal(str(ar_result.scalar_one() or 0))

    # DSO numerator is total_ar; denominator is paid revenue in the last 30 days
    from datetime import timedelta

    thirty_days_ago = datetime(today.year, today.month, today.day, tzinfo=timezone.utc) - timedelta(
        days=30
    )
    rev_result = await db.execute(
        select(func.coalesce(func.sum(Invoice.amount), 0)).where(
            Invoice.status == "paid",
            Invoice.paid_at >= thirty_days_ago,
        )
    )
    revenue_30d = Decimal(str(rev_result.scalar_one() or 0))
    dso: float | None = float(total_ar / revenue_30d * 30) if revenue_30d > 0 else None

    return FinanceStats(
        mrr=mrr,
        arr=mrr * 12,
        total_ar=total_ar,
        dso=dso,
        gross_margin=None,
    )


@router.get("/invoices", response_model=list[InvoiceResponse])
async def list_invoices(
    status: str | None = Query(None, pattern="^(draft|sent|paid|overdue)$"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> list[Invoice]:
    query = select(Invoice)

    if status is not None:
        query = query.where(Invoice.status == status)

    query = query.order_by(Invoice.due_date.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/ar-aging", response_model=ARAgingResponse)
async def get_ar_aging(db: AsyncSession = Depends(get_db)) -> ARAgingResponse:
    """
    Return AR aging buckets for all outstanding (sent + overdue) invoices.

    Buckets: 0-30 days, 31-60 days, 61-90 days, 90+ days past due date.
    """
    today = datetime.now(timezone.utc).date()

    result = await db.execute(
        select(Invoice).where(Invoice.status.in_(["sent", "overdue"]))
    )
    invoices: list[Invoice] = list(result.scalars().all())

    bucket_defs: list[tuple[str, int, int | None]] = [
        ("0-30", 0, 30),
        ("31-60", 31, 60),
        ("61-90", 61, 90),
        ("90+", 91, None),
    ]

    buckets: list[ARAgingBucket] = []
    for label, min_days, max_days in bucket_defs:
        matching = [
            inv
            for inv in invoices
            if _days_outstanding(inv, today) >= min_days
            and (max_days is None or _days_outstanding(inv, today) <= max_days)
        ]
        buckets.append(
            ARAgingBucket(
                label=label,
                min_days=min_days,
                max_days=max_days,
                count=len(matching),
                total=sum((inv.amount for inv in matching), Decimal("0")),
            )
        )

    return ARAgingResponse(buckets=buckets, as_of=today)
