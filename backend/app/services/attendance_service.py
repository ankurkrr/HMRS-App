"""Attendance service — business logic with invariant enforcement."""

import logging
from datetime import date, datetime, timezone

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import Attendance
from app.repositories.attendance_repo import AttendanceRepository
from app.repositories.employee_repo import EmployeeRepository
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate
from app.services.exceptions import (
    ConflictException,
    NotFoundException,
    ValidationException,
)

logger = logging.getLogger(__name__)


class AttendanceService:
    """Attendance business logic.

    Enforces:
        - INV-5:  Attendance date cannot be in the future
        - INV-10: Attendance date must be ≥ employee.date_of_joining
        - Pre-validates employee existence (friendly 404 over raw FK error)
    """

    def __init__(self, db: AsyncSession):
        self.attendance_repo = AttendanceRepository(db)
        self.employee_repo = EmployeeRepository(db)
        self.db = db

    async def mark_attendance(self, data: AttendanceCreate) -> Attendance:
        """Create an attendance record.

        Validates all invariants before INSERT.
        Rejects duplicates with 409 (not upsert).
        """
        # Pre-validate employee existence — friendly 404
        employee = await self.employee_repo.get_by_id(data.employee_id)
        if employee is None:
            raise NotFoundException(
                error_code="EMPLOYEE_NOT_FOUND",
                message="Employee not found",
                details={"employee_id": data.employee_id},
            )

        # INV-5: No future dates
        if data.date > date.today():
            raise ValidationException(
                error_code="FUTURE_DATE",
                message="Attendance date cannot be in the future",
                details={"date": str(data.date), "today": str(date.today())},
            )

        # INV-10: Date must be ≥ date_of_joining
        if data.date < employee.date_of_joining:
            raise ValidationException(
                error_code="ATTENDANCE_BEFORE_JOINING",
                message="Attendance date cannot be before employee's joining date",
                details={
                    "date": str(data.date),
                    "date_of_joining": str(employee.date_of_joining),
                },
            )

        attendance = Attendance(
            employee_id=data.employee_id,
            date=data.date,
            status=data.status.value,
            check_in=data.check_in,
            check_out=data.check_out,
            notes=data.notes,
        )

        try:
            return await self.attendance_repo.create(attendance)
        except IntegrityError:
            await self.db.rollback()
            raise ConflictException(
                error_code="ATTENDANCE_DUPLICATE",
                message="Attendance already recorded for this date",
                details={
                    "employee_id": data.employee_id,
                    "date": str(data.date),
                },
            )

    async def get_attendance(self, attendance_id: str) -> Attendance:
        """Fetch attendance by ID with employee data, or raise 404."""
        attendance = await self.attendance_repo.get_by_id(attendance_id)
        if attendance is None:
            raise NotFoundException(
                error_code="ATTENDANCE_NOT_FOUND",
                message="Attendance record not found",
                details={"attendance_id": attendance_id},
            )
        return attendance

    async def list_attendance(
        self,
        *,
        page: int = 1,
        per_page: int = 20,
        employee_id: str | None = None,
        attendance_date: date | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        status: str | None = None,
        department: str | None = None,
    ) -> tuple[list[Attendance], int]:
        """Paginated attendance listing with filters."""
        per_page = min(per_page, 100)
        return await self.attendance_repo.list(
            page=page,
            per_page=per_page,
            employee_id=employee_id,
            attendance_date=attendance_date,
            date_from=date_from,
            date_to=date_to,
            status=status,
            department=department,
        )

    async def update_attendance(self, attendance_id: str, data: AttendanceUpdate) -> Attendance:
        """Update attendance fields. employee_id and date are immutable."""
        attendance = await self.get_attendance(attendance_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "status" and value is not None:
                setattr(attendance, field, value.value if hasattr(value, "value") else value)
            else:
                setattr(attendance, field, value)

        attendance.updated_at = datetime.now(timezone.utc)
        return await self.attendance_repo.update(attendance)

    async def delete_attendance(self, attendance_id: str) -> None:
        """Delete attendance record. Returns 404 if not found.

        Audit: logs the deleted record before removal.
        """
        attendance = await self.get_attendance(attendance_id)

        logger.warning(
            "AUDIT: Deleting attendance record",
            extra={
                "action": "DELETE",
                "entity": "attendance",
                "entity_id": attendance.id,
                "entity_data": {
                    "employee_id": attendance.employee_id,
                    "date": str(attendance.date),
                    "status": attendance.status,
                },
            },
        )

        await self.attendance_repo.delete(attendance)
