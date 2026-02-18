"""Employee ORM model with DB-level integrity constraints."""

import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Employee(Base):
    """Employee entity.

    Invariants enforced at DB level:
        - INV-1: email is globally unique
        - INV-2: employee_code is globally unique
        - INV-8: deleting employee cascades attendance deletion
        - INV-9: created_at / updated_at are system-managed
    """

    __tablename__ = "employee"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        doc="UUID primary key — non-enumerable, globally unique",
    )
    employee_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
        doc="Immutable business identifier (e.g., EMP-001)",
    )
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    department: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    designation: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    date_of_joining: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )
    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationship — one-to-many with cascade delete
    attendances: Mapped[list["Attendance"]] = relationship(
        "Attendance",
        back_populates="employee",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<Employee(id={self.id}, code={self.employee_code}, name={self.name})>"
