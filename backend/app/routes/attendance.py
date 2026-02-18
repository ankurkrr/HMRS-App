"""Attendance API endpoints."""

import math
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.attendance import AttendanceCreate, AttendanceResponse, AttendanceUpdate
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.services.attendance_service import AttendanceService

router = APIRouter(prefix="/attendance", tags=["Attendance"])


def _get_service(db: AsyncSession = Depends(get_db)) -> AttendanceService:
    return AttendanceService(db)


def _attendance_to_response(attendance) -> AttendanceResponse:
    """Map attendance ORM model to response with denormalized employee fields."""
    return AttendanceResponse(
        id=attendance.id,
        employee_id=attendance.employee_id,
        employee_name=attendance.employee.name if attendance.employee else None,
        employee_code=attendance.employee.employee_code if attendance.employee else None,
        date=attendance.date,
        status=attendance.status,
        check_in=attendance.check_in,
        check_out=attendance.check_out,
        notes=attendance.notes,
        created_at=attendance.created_at,
        updated_at=attendance.updated_at,
    )


@router.post(
    "",
    response_model=AttendanceResponse,
    status_code=201,
    summary="Mark attendance for an employee",
    responses={
        404: {"description": "Employee not found"},
        409: {"description": "Attendance already exists for this date"},
        422: {"description": "Validation: future date, date before joining, invalid status"},
    },
)
async def mark_attendance(
    data: AttendanceCreate,
    service: AttendanceService = Depends(_get_service),
):
    attendance = await service.mark_attendance(data)
    # Reload with employee relationship for response
    attendance = await service.get_attendance(attendance.id)
    return _attendance_to_response(attendance)


@router.get(
    "",
    response_model=PaginatedResponse[AttendanceResponse],
    summary="List attendance records with filters",
)
async def list_attendance(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    employee_id: str | None = Query(default=None),
    date: date | None = Query(default=None, alias="date"),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    status: str | None = Query(default=None),
    department: str | None = Query(default=None),
    service: AttendanceService = Depends(_get_service),
):
    records, total = await service.list_attendance(
        page=page,
        per_page=per_page,
        employee_id=employee_id,
        attendance_date=date,
        date_from=date_from,
        date_to=date_to,
        status=status,
        department=department,
    )
    return PaginatedResponse(
        data=[_attendance_to_response(r) for r in records],
        meta=PaginationMeta(
            page=page,
            per_page=per_page,
            total=total,
            total_pages=math.ceil(total / per_page) if per_page > 0 else 0,
        ),
    )


@router.get(
    "/{attendance_id}",
    response_model=AttendanceResponse,
    summary="Get attendance record by ID",
    responses={404: {"description": "Record not found"}},
)
async def get_attendance(
    attendance_id: str,
    service: AttendanceService = Depends(_get_service),
):
    attendance = await service.get_attendance(attendance_id)
    return _attendance_to_response(attendance)


@router.put(
    "/{attendance_id}",
    response_model=AttendanceResponse,
    summary="Update attendance record (employee_id and date are immutable)",
    responses={404: {"description": "Record not found"}, 422: {"description": "Validation error"}},
)
async def update_attendance(
    attendance_id: str,
    data: AttendanceUpdate,
    service: AttendanceService = Depends(_get_service),
):
    attendance = await service.update_attendance(attendance_id, data)
    attendance = await service.get_attendance(attendance.id)
    return _attendance_to_response(attendance)


@router.delete(
    "/{attendance_id}",
    status_code=204,
    summary="Delete attendance record",
    responses={404: {"description": "Record not found"}},
)
async def delete_attendance(
    attendance_id: str,
    service: AttendanceService = Depends(_get_service),
):
    await service.delete_attendance(attendance_id)
