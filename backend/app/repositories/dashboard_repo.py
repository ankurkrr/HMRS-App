"""Dashboard repository — aggregation queries for the summary endpoint."""

from datetime import date

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import Attendance
from app.models.employee import Employee


class DashboardRepository:
    """Encapsulates dashboard aggregation queries.

    All aggregations use single SQL queries with GROUP BY (Section 7.2 of design).
    No application-level assembly.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_summary(
        self,
        *,
        date_from: date,
        date_to: date,
        department: str | None = None,
        include_inactive: bool = False,
    ) -> dict:
        """Compute aggregated attendance summary.

        Uses conditional aggregation (CASE WHEN) in a single query rather
        than multiple GROUP BY queries — O(log n + k) on idx_attendance_date.
        """
        # Count total employees matching filters (INV-11: exclude inactive by default)
        emp_count_query = select(func.count(Employee.id))
        if not include_inactive:
            emp_count_query = emp_count_query.where(Employee.is_active == True)
        if department:
            emp_count_query = emp_count_query.where(Employee.department == department)

        emp_result = await self.db.execute(emp_count_query)
        total_employees = emp_result.scalar_one()

        # Attendance summary — single query with conditional aggregation
        summary_query = (
            select(
                func.count(
                    case((Attendance.status == "PRESENT", 1))
                ).label("present"),
                func.count(
                    case((Attendance.status == "ABSENT", 1))
                ).label("absent"),
                func.count(
                    case((Attendance.status == "HALF_DAY", 1))
                ).label("half_day"),
                func.count(
                    case((Attendance.status == "ON_LEAVE", 1))
                ).label("on_leave"),
            )
            .join(Employee, Attendance.employee_id == Employee.id)
            .where(Attendance.date.between(date_from, date_to))
        )

        if not include_inactive:
            summary_query = summary_query.where(Employee.is_active == True)
        if department:
            summary_query = summary_query.where(Employee.department == department)

        summary_result = await self.db.execute(summary_query)
        row = summary_result.one()

        summary = {
            "present": row.present or 0,
            "absent": row.absent or 0,
            "half_day": row.half_day or 0,
            "on_leave": row.on_leave or 0,
        }

        # Attendance rate
        total_records = sum(summary.values())
        attendance_rate = 0.0
        if total_records > 0:
            attendance_rate = round((summary["present"] + summary["half_day"] * 0.5) / total_records * 100, 2)

        # Department breakdown — single query with GROUP BY
        dept_query = (
            select(
                Employee.department,
                func.count(
                    case((Attendance.status == "PRESENT", 1))
                ).label("present"),
                func.count(
                    case((Attendance.status == "ABSENT", 1))
                ).label("absent"),
                func.count(
                    case((Attendance.status == "HALF_DAY", 1))
                ).label("half_day"),
                func.count(
                    case((Attendance.status == "ON_LEAVE", 1))
                ).label("on_leave"),
            )
            .join(Employee, Attendance.employee_id == Employee.id)
            .where(Attendance.date.between(date_from, date_to))
            .group_by(Employee.department)
        )

        if not include_inactive:
            dept_query = dept_query.where(Employee.is_active == True)
        if department:
            dept_query = dept_query.where(Employee.department == department)

        dept_result = await self.db.execute(dept_query)
        department_breakdown = [
            {
                "department": row.department,
                "present": row.present or 0,
                "absent": row.absent or 0,
                "half_day": row.half_day or 0,
                "on_leave": row.on_leave or 0,
            }
            for row in dept_result.all()
        ]

        return {
            "total_employees": total_employees,
            "summary": summary,
            "attendance_rate": attendance_rate,
            "department_breakdown": department_breakdown,
        }
