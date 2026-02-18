"""Dashboard service — orchestrates aggregation queries."""

from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.dashboard_repo import DashboardRepository
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    DateRange,
    DepartmentBreakdown,
    StatusSummary,
)


class DashboardService:
    """Dashboard business logic — thin orchestration over repository."""

    def __init__(self, db: AsyncSession):
        self.repo = DashboardRepository(db)

    async def get_summary(
        self,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
        department: str | None = None,
        include_inactive: bool = False,
    ) -> DashboardSummaryResponse:
        """Get aggregated dashboard summary.

        Defaults to today if no date range specified.
        """
        if date_from is None:
            date_from = date.today()
        if date_to is None:
            date_to = date_from

        result = await self.repo.get_summary(
            date_from=date_from,
            date_to=date_to,
            department=department,
            include_inactive=include_inactive,
        )

        return DashboardSummaryResponse(
            date_range=DateRange(date_from=date_from, date_to=date_to),
            total_employees=result["total_employees"],
            summary=StatusSummary(**result["summary"]),
            attendance_rate=result["attendance_rate"],
            department_breakdown=[
                DepartmentBreakdown(**dept) for dept in result["department_breakdown"]
            ],
        )
