"""Attendance repository — data access layer for attendance operations."""

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.attendance import Attendance
from app.models.employee import Employee


class AttendanceRepository:
    """Encapsulates all attendance-related database queries."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, attendance: Attendance) -> Attendance:
        """Insert a new attendance record."""
        self.db.add(attendance)
        await self.db.flush()
        await self.db.refresh(attendance)
        return attendance

    async def get_by_id(self, attendance_id: str) -> Attendance | None:
        """Fetch attendance by UUID with eager-loaded employee."""
        result = await self.db.execute(
            select(Attendance)
            .options(joinedload(Attendance.employee))
            .where(Attendance.id == attendance_id)
        )
        return result.scalar_one_or_none()

    async def get_by_employee_and_date(
        self, employee_id: str, attendance_date: date
    ) -> Attendance | None:
        """Check for existing attendance. O(log n) on composite unique index."""
        result = await self.db.execute(
            select(Attendance).where(
                Attendance.employee_id == employee_id,
                Attendance.date == attendance_date,
            )
        )
        return result.scalar_one_or_none()

    async def list(
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
        """Paginated listing with filters and eager-loaded employee data.

        Uses a single JOIN query to prevent N+1 (Section 7.3 of design).
        """
        query = select(Attendance).options(joinedload(Attendance.employee))
        count_query = select(func.count(Attendance.id))

        # If department filter, need to join employee table for count query too
        if department is not None:
            query = query.join(Employee, Attendance.employee_id == Employee.id).where(
                Employee.department == department
            )
            count_query = count_query.join(
                Employee, Attendance.employee_id == Employee.id
            ).where(Employee.department == department)

        if employee_id is not None:
            query = query.where(Attendance.employee_id == employee_id)
            count_query = count_query.where(Attendance.employee_id == employee_id)

        if attendance_date is not None:
            query = query.where(Attendance.date == attendance_date)
            count_query = count_query.where(Attendance.date == attendance_date)

        if date_from is not None:
            query = query.where(Attendance.date >= date_from)
            count_query = count_query.where(Attendance.date >= date_from)

        if date_to is not None:
            query = query.where(Attendance.date <= date_to)
            count_query = count_query.where(Attendance.date <= date_to)

        if status is not None:
            query = query.where(Attendance.status == status)
            count_query = count_query.where(Attendance.status == status)

        # Total count
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        # Paginated results
        offset = (page - 1) * per_page
        query = query.order_by(Attendance.date.desc(), Attendance.created_at.desc()).offset(offset).limit(per_page)

        result = await self.db.execute(query)
        attendances = list(result.unique().scalars().all())

        return attendances, total

    async def update(self, attendance: Attendance) -> Attendance:
        """Update an existing attendance record."""
        await self.db.flush()
        await self.db.refresh(attendance)
        return attendance

    async def delete(self, attendance: Attendance) -> None:
        """Hard delete an attendance record."""
        await self.db.delete(attendance)
        await self.db.flush()
