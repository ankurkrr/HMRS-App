"""Employee service — business logic layer for employee operations."""

import json
import logging
from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.repositories.employee_repo import EmployeeRepository
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.services.exceptions import ConflictException, NotFoundException

logger = logging.getLogger(__name__)


class EmployeeService:
    """Employee business logic.

    Responsibilities:
        - Orchestrates repository calls
        - Enforces business rules not expressible as DB constraints
        - Maps DB integrity errors to domain exceptions
        - Audit logs destructive operations
    """

    def __init__(self, db: AsyncSession):
        self.repo = EmployeeRepository(db)
        self.db = db

    async def create_employee(self, data: EmployeeCreate) -> Employee:
        """Create a new employee.

        Raises ConflictException if email or employee_code already exists.
        """
        employee = Employee(
            employee_code=data.employee_code,
            name=data.name,
            email=data.email,
            department=data.department,
            designation=data.designation,
            date_of_joining=data.date_of_joining,
            phone=data.phone,
        )

        try:
            return await self.repo.create(employee)
        except IntegrityError as e:
            await self.db.rollback()
            error_msg = str(e.orig).lower()
            if "email" in error_msg:
                raise ConflictException(
                    error_code="EMPLOYEE_EMAIL_EXISTS",
                    message="An employee with this email already exists",
                    details={"email": data.email},
                )
            if "employee_code" in error_msg:
                raise ConflictException(
                    error_code="EMPLOYEE_CODE_EXISTS",
                    message="An employee with this code already exists",
                    details={"employee_code": data.employee_code},
                )
            raise ConflictException(
                error_code="EMPLOYEE_CONFLICT",
                message="Employee data conflicts with existing records",
            )

    async def get_employee(self, employee_id: str) -> Employee:
        """Fetch employee by ID or raise 404."""
        employee = await self.repo.get_by_id(employee_id)
        if employee is None:
            raise NotFoundException(
                error_code="EMPLOYEE_NOT_FOUND",
                message="Employee not found",
                details={"employee_id": employee_id},
            )
        return employee

    async def list_employees(
        self,
        *,
        page: int = 1,
        per_page: int = 20,
        department: str | None = None,
        is_active: bool | None = None,
        search: str | None = None,
    ) -> tuple[list[Employee], int]:
        """Paginated employee listing with filters."""
        per_page = min(per_page, 100)  # Cap at 100
        return await self.repo.list(
            page=page,
            per_page=per_page,
            department=department,
            is_active=is_active,
            search=search,
        )

    async def update_employee(self, employee_id: str, data: EmployeeUpdate) -> Employee:
        """Update employee fields. employee_code is immutable."""
        employee = await self.get_employee(employee_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(employee, field, value)

        employee.updated_at = datetime.now(timezone.utc)

        try:
            return await self.repo.update(employee)
        except IntegrityError as e:
            await self.db.rollback()
            error_msg = str(e.orig).lower()
            if "email" in error_msg:
                raise ConflictException(
                    error_code="EMPLOYEE_EMAIL_EXISTS",
                    message="An employee with this email already exists",
                    details={"email": data.email},
                )
            raise ConflictException(
                error_code="EMPLOYEE_CONFLICT",
                message="Update conflicts with existing records",
            )

    async def delete_employee(self, employee_id: str) -> None:
        """Delete employee with cascade. Returns 404 if not found.

        Audit: logs the deleted entity before removal.
        """
        employee = await self.get_employee(employee_id)

        # Audit log — serialize before deletion
        logger.warning(
            "AUDIT: Deleting employee",
            extra={
                "action": "DELETE",
                "entity": "employee",
                "entity_id": employee.id,
                "entity_data": {
                    "employee_code": employee.employee_code,
                    "name": employee.name,
                    "email": employee.email,
                    "department": employee.department,
                },
            },
        )

        await self.repo.delete(employee)
