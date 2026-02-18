"""Employee endpoint integration tests."""

import pytest


@pytest.mark.asyncio
async def test_create_employee_success(client):
    """Test successful employee creation with 201 and Location header."""
    response = await client.post("/api/v1/employees", json={
        "employee_code": "EMP-001",
        "name": "Test User",
        "email": "test@company.com",
        "department": "Engineering",
        "date_of_joining": "2025-06-15",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["employee_code"] == "EMP-001"
    assert data["name"] == "Test User"
    assert data["email"] == "test@company.com"
    assert data["is_active"] is True
    assert "Location" in response.headers


@pytest.mark.asyncio
async def test_create_employee_duplicate_email_409(client):
    """INV-1: Duplicate email returns 409 Conflict."""
    payload = {
        "employee_code": "EMP-001",
        "name": "User One",
        "email": "duplicate@company.com",
        "department": "Engineering",
        "date_of_joining": "2025-06-15",
    }
    await client.post("/api/v1/employees", json=payload)

    payload["employee_code"] = "EMP-002"
    response = await client.post("/api/v1/employees", json=payload)
    assert response.status_code == 409
    assert response.json()["error_code"] == "EMPLOYEE_EMAIL_EXISTS"


@pytest.mark.asyncio
async def test_create_employee_duplicate_code_409(client):
    """INV-2: Duplicate employee_code returns 409 Conflict."""
    payload = {
        "employee_code": "EMP-001",
        "name": "User One",
        "email": "user1@company.com",
        "department": "HR",
        "date_of_joining": "2025-06-15",
    }
    await client.post("/api/v1/employees", json=payload)

    payload["email"] = "user2@company.com"
    response = await client.post("/api/v1/employees", json=payload)
    assert response.status_code == 409
    assert response.json()["error_code"] == "EMPLOYEE_CODE_EXISTS"


@pytest.mark.asyncio
async def test_get_employee_404(client):
    """Non-existent employee returns 404."""
    response = await client.get("/api/v1/employees/nonexistent-uuid")
    assert response.status_code == 404
    assert response.json()["error_code"] == "EMPLOYEE_NOT_FOUND"


@pytest.mark.asyncio
async def test_list_employees_pagination(client):
    """Test paginated listing with empty result."""
    response = await client.get("/api/v1/employees?page=1&per_page=10")
    assert response.status_code == 200
    data = response.json()
    assert data["data"] == []
    assert data["meta"]["total"] == 0


@pytest.mark.asyncio
async def test_update_employee(client):
    """Test employee update."""
    create_resp = await client.post("/api/v1/employees", json={
        "employee_code": "EMP-001",
        "name": "Original Name",
        "email": "original@company.com",
        "department": "Engineering",
        "date_of_joining": "2025-06-15",
    })
    employee_id = create_resp.json()["id"]

    update_resp = await client.put(f"/api/v1/employees/{employee_id}", json={
        "name": "Updated Name",
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_delete_employee_success(client):
    """Test employee deletion returns 204."""
    create_resp = await client.post("/api/v1/employees", json={
        "employee_code": "EMP-001",
        "name": "To Delete",
        "email": "delete@company.com",
        "department": "HR",
        "date_of_joining": "2025-06-15",
    })
    employee_id = create_resp.json()["id"]

    delete_resp = await client.delete(f"/api/v1/employees/{employee_id}")
    assert delete_resp.status_code == 204

    # Verify deleted
    get_resp = await client.get(f"/api/v1/employees/{employee_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_employee_not_found_404(client):
    """DELETE non-existent employee returns 404."""
    response = await client.delete("/api/v1/employees/nonexistent-uuid")
    assert response.status_code == 404
