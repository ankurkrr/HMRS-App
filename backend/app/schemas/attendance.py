"""Attendance Pydantic schemas."""

from datetime import date, datetime, time
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class AttendanceStatus(str, Enum):
    """Closed set of attendance status values (INV-6)."""

    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    HALF_DAY = "HALF_DAY"
    ON_LEAVE = "ON_LEAVE"


class AttendanceCreate(BaseModel):
    """Request schema for marking attendance."""

    employee_id: str = Field(..., description="UUID of the employee")
    date: date
    status: AttendanceStatus
    check_in: time | None = None
    check_out: time | None = None
    notes: str | None = None

    @field_validator("check_out")
    @classmethod
    def validate_check_out_after_check_in(cls, v: time | None, info) -> time | None:
        """Ensure check_out is after check_in when both are present."""
        if v is not None and info.data.get("check_in") is not None:
            if v <= info.data["check_in"]:
                raise ValueError("check_out must be after check_in")
        return v


class AttendanceUpdate(BaseModel):
    """Request schema for updating attendance. employee_id and date are immutable."""

    status: AttendanceStatus | None = None
    check_in: time | None = None
    check_out: time | None = None
    notes: str | None = None

    @field_validator("check_out")
    @classmethod
    def validate_check_out_after_check_in(cls, v: time | None, info) -> time | None:
        if v is not None and info.data.get("check_in") is not None:
            if v <= info.data["check_in"]:
                raise ValueError("check_out must be after check_in")
        return v


class AttendanceResponse(BaseModel):
    """Response schema for attendance data, includes denormalized employee info."""

    id: str
    employee_id: str
    employee_name: str | None = None
    employee_code: str | None = None
    date: date
    status: str
    check_in: time | None
    check_out: time | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
