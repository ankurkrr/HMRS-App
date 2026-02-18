"""Dashboard API endpoint — aggregated summary."""

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _get_service(db: AsyncSession = Depends(get_db)) -> DashboardService:
    return DashboardService(db)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
    summary="Get aggregated attendance summary",
    description="Returns attendance counts, rates, and department breakdown. "
    "Excludes inactive employees by default (INV-11). "
    "Set include_inactive=true to include them.",
)
async def get_summary(
    date_from: date | None = Query(default=None, description="Start date (defaults to today)"),
    date_to: date | None = Query(default=None, description="End date (defaults to date_from)"),
    department: str | None = Query(default=None),
    include_inactive: bool = Query(default=False, description="Include inactive employees"),
    service: DashboardService = Depends(_get_service),
):
    return await service.get_summary(
        date_from=date_from,
        date_to=date_to,
        department=department,
        include_inactive=include_inactive,
    )
