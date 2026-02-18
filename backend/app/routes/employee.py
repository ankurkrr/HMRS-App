"""Employee API endpoints."""

import math

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.schemas.employee import EmployeeCreate, EmployeeResponse, EmployeeUpdate
from app.services.employee_service import EmployeeService

router = APIRouter(prefix="/employees", tags=["Employees"])


def _get_service(db: AsyncSession = Depends(get_db)) -> EmployeeService:
    return EmployeeService(db)


@router.post(
    "",
    response_model=EmployeeResponse,
    status_code=201,
    summary="Create a new employee",
    responses={409: {"description": "Email or employee_code conflict"}, 422: {"description": "Validation error"}},
)
async def create_employee(
    data: EmployeeCreate,
    response: Response,
    service: EmployeeService = Depends(_get_service),
):
    employee = await service.create_employee(data)
    response.headers["Location"] = f"/api/v1/employees/{employee.id}"
    return employee


@router.get(
    "",
    response_model=PaginatedResponse[EmployeeResponse],
    summary="List employees with pagination and filters",
)
async def list_employees(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    department: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    search: str | None = Query(default=None, description="Search name, email, or code"),
    service: EmployeeService = Depends(_get_service),
):
    employees, total = await service.list_employees(
        page=page, per_page=per_page, department=department, is_active=is_active, search=search
    )
    return PaginatedResponse(
        data=[EmployeeResponse.model_validate(e) for e in employees],
        meta=PaginationMeta(
            page=page,
            per_page=per_page,
            total=total,
            total_pages=math.ceil(total / per_page) if per_page > 0 else 0,
        ),
    )


@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse,
    summary="Get employee by ID",
    responses={404: {"description": "Employee not found"}},
)
async def get_employee(
    employee_id: str,
    service: EmployeeService = Depends(_get_service),
):
    return await service.get_employee(employee_id)


@router.put(
    "/{employee_id}",
    response_model=EmployeeResponse,
    summary="Update employee",
    responses={404: {"description": "Not found"}, 409: {"description": "Email conflict"}, 422: {"description": "Validation error"}},
)
async def update_employee(
    employee_id: str,
    data: EmployeeUpdate,
    service: EmployeeService = Depends(_get_service),
):
    return await service.update_employee(employee_id, data)


@router.delete(
    "/{employee_id}",
    status_code=204,
    summary="Delete employee (cascades attendance)",
    responses={404: {"description": "Employee not found"}},
)
async def delete_employee(
    employee_id: str,
    service: EmployeeService = Depends(_get_service),
):
    await service.delete_employee(employee_id)
