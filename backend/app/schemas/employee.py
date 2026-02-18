"""Employee Pydantic schemas for request validation and response serialization."""

from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


class EmployeeCreate(BaseModel):
    """Request schema for creating an employee."""

    employee_code: str = Field(
        ..., min_length=1, max_length=20, description="Unique business identifier (e.g., EMP-001)"
    )
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=5, max_length=255, description="Unique email address")
    department: str = Field(..., min_length=1, max_length=100)
    designation: str | None = Field(default=None, max_length=100)
    date_of_joining: date
    phone: str | None = Field(default=None, max_length=20)

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        """Basic email format validation."""
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email format")
        return v.lower().strip()

    @field_validator("employee_code")
    @classmethod
    def normalize_employee_code(cls, v: str) -> str:
        return v.strip().upper()


class EmployeeUpdate(BaseModel):
    """Request schema for updating an employee. All fields optional."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: str | None = Field(default=None, min_length=5, max_length=255)
    department: str | None = Field(default=None, min_length=1, max_length=100)
    designation: str | None = Field(default=None, max_length=100)
    date_of_joining: date | None = None
    phone: str | None = Field(default=None, max_length=20)
    is_active: bool | None = None

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email format")
        return v.lower().strip()


class EmployeeResponse(BaseModel):
    """Response schema for employee data."""

    id: str
    employee_code: str
    name: str
    email: str
    department: str
    designation: str | None
    date_of_joining: date
    phone: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
