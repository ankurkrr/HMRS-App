"""Pydantic schemas package."""

from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
)
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceUpdate,
    AttendanceResponse,
)
from app.schemas.dashboard import DashboardSummaryResponse
from app.schemas.common import ErrorResponse, PaginationMeta, PaginatedResponse

__all__ = [
    "EmployeeCreate",
    "EmployeeUpdate",
    "EmployeeResponse",
    "AttendanceCreate",
    "AttendanceUpdate",
    "AttendanceResponse",
    "DashboardSummaryResponse",
    "ErrorResponse",
    "PaginationMeta",
    "PaginatedResponse",
]
