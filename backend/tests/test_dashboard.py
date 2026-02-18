"""Dashboard and cascade invariant tests."""

from datetime import date, timedelta

import pytest


@pytest.fixture
async def seeded_data(client):
    """Create employees with attendance for dashboard tests."""
    # Create two employees in different departments
    emp1_resp = await client.post("/api/v1/employees", json={
        "employee_code": "EMP-D01",
        "name": "Dashboard User 1",
        "email": "dash1@company.com",
        "department": "Engineering",
        "date_of_joining": "2025-01-01",
    })
    emp2_resp = await client.post("/api/v1/employees", json={
        "employee_code": "EMP-D02",
        "name": "Dashboard User 2",
        "email": "dash2@company.com",
        "department": "HR",
        "date_of_joining": "2025-01-01",
    })

    emp1_id = emp1_resp.json()["id"]
    emp2_id = emp2_resp.json()["id"]
    today = date.today().isoformat()

    # Mark attendance
    await client.post("/api/v1/attendance", json={
        "employee_id": emp1_id, "date": today, "status": "PRESENT",
    })
    await client.post("/api/v1/attendance", json={
        "employee_id": emp2_id, "date": today, "status": "ABSENT",
    })

    return {"emp1_id": emp1_id, "emp2_id": emp2_id, "date": today}


@pytest.mark.asyncio
async def test_dashboard_summary(client, seeded_data):
    """Test dashboard returns correct aggregations."""
    today = seeded_data["date"]
    response = await client.get(f"/api/v1/dashboard/summary?date_from={today}&date_to={today}")
    assert response.status_code == 200
    data = response.json()
    assert data["total_employees"] == 2
    assert data["summary"]["present"] == 1
    assert data["summary"]["absent"] == 1
    assert len(data["department_breakdown"]) == 2


@pytest.mark.asyncio
async def test_dashboard_department_filter(client, seeded_data):
    """Test dashboard with department filter."""
    today = seeded_data["date"]
    response = await client.get(f"/api/v1/dashboard/summary?date_from={today}&date_to={today}&department=Engineering")
    assert response.status_code == 200
    data = response.json()
    assert data["total_employees"] == 1
    assert data["summary"]["present"] == 1
    assert data["summary"]["absent"] == 0


@pytest.mark.asyncio
async def test_cascade_delete_employee_removes_attendance(client, seeded_data):
    """INV-8: Deleting employee cascades to attendance records."""
    emp1_id = seeded_data["emp1_id"]

    # Verify attendance exists
    att_resp = await client.get(f"/api/v1/attendance?employee_id={emp1_id}")
    assert att_resp.json()["meta"]["total"] == 1

    # Delete employee
    delete_resp = await client.delete(f"/api/v1/employees/{emp1_id}")
    assert delete_resp.status_code == 204

    # Verify attendance is cascade-deleted
    att_resp = await client.get(f"/api/v1/attendance?employee_id={emp1_id}")
    assert att_resp.json()["meta"]["total"] == 0


@pytest.mark.asyncio
async def test_health_endpoint(client):
    """Health check returns ok."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
