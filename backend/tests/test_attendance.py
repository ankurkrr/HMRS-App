"""Attendance endpoint integration tests."""

from datetime import date, timedelta

import pytest


@pytest.fixture
async def employee_id(client):
    """Create an employee and return their ID for attendance tests."""
    resp = await client.post("/api/v1/employees", json={
        "employee_code": "EMP-ATT-001",
        "name": "Attendance Test User",
        "email": "att.test@company.com",
        "department": "Engineering",
        "date_of_joining": "2025-01-01",
    })
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_mark_attendance_success(client, employee_id):
    """Test successful attendance marking with 201."""
    today = date.today().isoformat()
    response = await client.post("/api/v1/attendance", json={
        "employee_id": employee_id,
        "date": today,
        "status": "PRESENT",
        "check_in": "09:00:00",
        "check_out": "18:00:00",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "PRESENT"
    assert data["employee_name"] == "Attendance Test User"
    assert data["employee_code"] == "EMP-ATT-001"


@pytest.mark.asyncio
async def test_mark_attendance_duplicate_409(client, employee_id):
    """INV-3: Duplicate attendance for same employee+date returns 409."""
    today = date.today().isoformat()
    await client.post("/api/v1/attendance", json={
        "employee_id": employee_id,
        "date": today,
        "status": "PRESENT",
    })

    response = await client.post("/api/v1/attendance", json={
        "employee_id": employee_id,
        "date": today,
        "status": "ABSENT",
    })
    assert response.status_code == 409
    assert response.json()["error_code"] == "ATTENDANCE_DUPLICATE"


@pytest.mark.asyncio
async def test_mark_attendance_nonexistent_employee_404(client):
    """Pre-validation: attendance for non-existent employee returns 404."""
    response = await client.post("/api/v1/attendance", json={
        "employee_id": "nonexistent-uuid",
        "date": date.today().isoformat(),
        "status": "PRESENT",
    })
    assert response.status_code == 404
    assert response.json()["error_code"] == "EMPLOYEE_NOT_FOUND"


@pytest.mark.asyncio
async def test_mark_attendance_future_date_422(client, employee_id):
    """INV-5: Future date attendance returns 422."""
    future = (date.today() + timedelta(days=5)).isoformat()
    response = await client.post("/api/v1/attendance", json={
        "employee_id": employee_id,
        "date": future,
        "status": "PRESENT",
    })
    assert response.status_code == 422
    assert response.json()["error_code"] == "FUTURE_DATE"


@pytest.mark.asyncio
async def test_mark_attendance_before_joining_422(client, employee_id):
    """INV-10: Attendance before date_of_joining returns 422."""
    response = await client.post("/api/v1/attendance", json={
        "employee_id": employee_id,
        "date": "2024-12-01",  # Before joining date 2025-01-01
        "status": "PRESENT",
    })
    assert response.status_code == 422
    assert response.json()["error_code"] == "ATTENDANCE_BEFORE_JOINING"


@pytest.mark.asyncio
async def test_mark_attendance_invalid_status_422(client, employee_id):
    """INV-6: Invalid status value returns 422."""
    response = await client.post("/api/v1/attendance", json={
        "employee_id": employee_id,
        "date": date.today().isoformat(),
        "status": "INVALID_STATUS",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_attendance_with_filters(client, employee_id):
    """Test filtered attendance listing."""
    today = date.today().isoformat()
    await client.post("/api/v1/attendance", json={
        "employee_id": employee_id,
        "date": today,
        "status": "PRESENT",
    })

    response = await client.get(f"/api/v1/attendance?employee_id={employee_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["meta"]["total"] == 1
    assert data["data"][0]["employee_id"] == employee_id


@pytest.mark.asyncio
async def test_delete_attendance_success(client, employee_id):
    """Test attendance deletion returns 204."""
    today = date.today().isoformat()
    create_resp = await client.post("/api/v1/attendance", json={
        "employee_id": employee_id,
        "date": today,
        "status": "ABSENT",
    })
    att_id = create_resp.json()["id"]

    delete_resp = await client.delete(f"/api/v1/attendance/{att_id}")
    assert delete_resp.status_code == 204


@pytest.mark.asyncio
async def test_delete_attendance_not_found_404(client):
    """DELETE non-existent attendance returns 404."""
    response = await client.delete("/api/v1/attendance/nonexistent-uuid")
    assert response.status_code == 404
