"""Shared schemas: error responses, pagination metadata."""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Standardized error response contract (Section 6.2 of design)."""

    error_code: str = Field(..., description="Machine-readable error identifier")
    message: str = Field(..., description="Human-readable error description")
    details: dict[str, Any] | None = Field(default=None, description="Optional structured context")


class PaginationMeta(BaseModel):
    """Pagination metadata for list endpoints."""

    page: int
    per_page: int
    total: int
    total_pages: int


DataT = TypeVar("DataT")


class PaginatedResponse(BaseModel, Generic[DataT]):
    """Generic paginated response wrapper."""

    data: list[DataT]
    meta: PaginationMeta
