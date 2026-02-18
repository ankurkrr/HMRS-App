"""Dashboard summary response schemas."""

from datetime import date

from pydantic import BaseModel


class StatusSummary(BaseModel):
    """Aggregated counts per attendance status."""

    present: int = 0
    absent: int = 0
    half_day: int = 0
    on_leave: int = 0


class DepartmentBreakdown(BaseModel):
    """Per-department attendance breakdown."""

    department: str
    present: int = 0
    absent: int = 0
    half_day: int = 0
    on_leave: int = 0


class DateRange(BaseModel):
    """Date range for the dashboard query."""

    date_from: date
    date_to: date


class DashboardSummaryResponse(BaseModel):
    """Aggregated dashboard summary (Section 5.2.3 of design)."""

    date_range: DateRange
    total_employees: int
    summary: StatusSummary
    attendance_rate: float
    department_breakdown: list[DepartmentBreakdown]
