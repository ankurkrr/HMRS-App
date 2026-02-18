"""Development seed data script.

Populates the database with realistic employee and attendance data
for local development and testing.
"""

import asyncio
import random
from datetime import date, time, timedelta

from app.database import async_session_factory, init_db
from app.models.attendance import Attendance
from app.models.employee import Employee


DEPARTMENTS = ["Engineering", "HR", "Finance", "Marketing", "Operations"]
DESIGNATIONS = [
    "Senior Developer", "Junior Developer", "Team Lead",
    "Manager", "Analyst", "Executive", "Intern",
]

SAMPLE_EMPLOYEES = [
    {"name": "Aman Sharma", "email": "aman.sharma@company.com", "department": "Engineering"},
    {"name": "Priya Patel", "email": "priya.patel@company.com", "department": "HR"},
    {"name": "Rahul Verma", "email": "rahul.verma@company.com", "department": "Engineering"},
    {"name": "Sneha Gupta", "email": "sneha.gupta@company.com", "department": "Finance"},
    {"name": "Vikram Singh", "email": "vikram.singh@company.com", "department": "Marketing"},
    {"name": "Anita Desai", "email": "anita.desai@company.com", "department": "Operations"},
    {"name": "Karan Mehta", "email": "karan.mehta@company.com", "department": "Engineering"},
    {"name": "Neha Iyer", "email": "neha.iyer@company.com", "department": "HR"},
    {"name": "Deepak Joshi", "email": "deepak.joshi@company.com", "department": "Finance"},
    {"name": "Meera Nair", "email": "meera.nair@company.com", "department": "Marketing"},
]

STATUSES = ["PRESENT", "ABSENT", "HALF_DAY", "ON_LEAVE"]
STATUS_WEIGHTS = [0.7, 0.1, 0.1, 0.1]  # 70% present


async def seed():
    """Seed the database with sample data."""
    await init_db()

    async with async_session_factory() as session:
        # Create employees
        employees = []
        for i, emp_data in enumerate(SAMPLE_EMPLOYEES, start=1):
            employee = Employee(
                employee_code=f"EMP-{i:03d}",
                name=emp_data["name"],
                email=emp_data["email"],
                department=emp_data["department"],
                designation=random.choice(DESIGNATIONS),
                date_of_joining=date(2025, random.randint(1, 12), random.randint(1, 28)),
                phone=f"+91{random.randint(7000000000, 9999999999)}",
            )
            session.add(employee)
            employees.append(employee)

        await session.flush()

        # Create attendance records for the last 30 days
        today = date.today()
        for employee in employees:
            for day_offset in range(30):
                attendance_date = today - timedelta(days=day_offset)

                # Skip weekends
                if attendance_date.weekday() >= 5:
                    continue

                # Skip if before joining date
                if attendance_date < employee.date_of_joining:
                    continue

                status = random.choices(STATUSES, weights=STATUS_WEIGHTS, k=1)[0]

                attendance = Attendance(
                    employee_id=employee.id,
                    date=attendance_date,
                    status=status,
                    check_in=time(9, random.randint(0, 30)) if status in ("PRESENT", "HALF_DAY") else None,
                    check_out=time(17, random.randint(0, 59)) if status == "PRESENT" else (
                        time(13, random.randint(0, 30)) if status == "HALF_DAY" else None
                    ),
                    notes=f"Auto-seeded {status.lower()} record" if status != "PRESENT" else None,
                )
                session.add(attendance)

        await session.commit()
        print(f"✅ Seeded {len(employees)} employees with attendance records for the last 30 working days.")


if __name__ == "__main__":
    asyncio.run(seed())
