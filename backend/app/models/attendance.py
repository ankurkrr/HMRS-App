"""Attendance ORM model with composite uniqueness and CHECK constraints."""

import uuid
from datetime import date, datetime, time

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    String,
    Text,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Attendance(Base):
    """Attendance entity.

    Invariants enforced at DB level:
        - INV-3: UNIQUE(employee_id, date) — one record per employee per day
        - INV-4: FK to employee with ON DELETE CASCADE
        - INV-6: status CHECK constraint for closed value set
        - INV-9: created_at / updated_at are system-managed
    """

    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_attendance_emp_date"),
        CheckConstraint(
            "status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE')",
            name="ck_attendance_status",
        ),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        doc="UUID primary key",
    )
    employee_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("employee.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    check_in: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )
    check_out: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
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

    # Relationship — many-to-one
    employee: Mapped["Employee"] = relationship(
        "Employee",
        back_populates="attendances",
    )

    def __repr__(self) -> str:
        return f"<Attendance(id={self.id}, employee={self.employee_id}, date={self.date}, status={self.status})>"
