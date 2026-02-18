"""Employee repository — data access layer for employee operations."""

import math

from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee


class EmployeeRepository:
    """Encapsulates all employee-related database queries."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, employee: Employee) -> Employee:
        """Insert a new employee."""
        self.db.add(employee)
        await self.db.flush()
        await self.db.refresh(employee)
        return employee

    async def get_by_id(self, employee_id: str) -> Employee | None:
        """Fetch employee by UUID.  O(log n) PK lookup."""
        result = await self.db.execute(
            select(Employee).where(Employee.id == employee_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Employee | None:
        """Fetch employee by email.  O(log n) unique index lookup."""
        result = await self.db.execute(
            select(Employee).where(Employee.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_employee_code(self, code: str) -> Employee | None:
        """Fetch employee by business code.  O(log n) unique index lookup."""
        result = await self.db.execute(
            select(Employee).where(Employee.employee_code == code)
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        *,
        page: int = 1,
        per_page: int = 20,
        department: str | None = None,
        is_active: bool | None = None,
        search: str | None = None,
    ) -> tuple[list[Employee], int]:
        """Paginated listing with filters.

        Returns (employees, total_count).
        Uses offset-based pagination with keyset-ready abstraction.
        """
        query = select(Employee)
        count_query = select(func.count(Employee.id))

        # Apply filters
        if department is not None:
            query = query.where(Employee.department == department)
            count_query = count_query.where(Employee.department == department)

        if is_active is not None:
            query = query.where(Employee.is_active == is_active)
            count_query = count_query.where(Employee.is_active == is_active)

        if search:
            search_filter = or_(
                Employee.name.ilike(f"%{search}%"),
                Employee.email.ilike(f"%{search}%"),
                Employee.employee_code.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        # Get total count
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        # Apply pagination
        offset = (page - 1) * per_page
        query = query.order_by(Employee.created_at.desc()).offset(offset).limit(per_page)

        result = await self.db.execute(query)
        employees = list(result.scalars().all())

        return employees, total

    async def update(self, employee: Employee) -> Employee:
        """Update an existing employee (already in session)."""
        await self.db.flush()
        await self.db.refresh(employee)
        return employee

    async def delete(self, employee: Employee) -> None:
        """Hard delete an employee (CASCADE to attendance via DB FK)."""
        await self.db.delete(employee)
        await self.db.flush()

    async def count_active(self) -> int:
        """Count active employees."""
        result = await self.db.execute(
            select(func.count(Employee.id)).where(Employee.is_active == True)
        )
        return result.scalar_one()
