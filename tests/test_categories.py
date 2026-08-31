from app.core.enums import UserRole
from app.models.user_models import User
from app.utils.jwt import create_access_token
from app.utils.security import hash_password


def _admin_headers(db_session):
    admin = User(
        first_name="Admin",
        last_name="User",
        email="admin@example.com",
        phone_no="9000000000",
        password_hash=hash_password("AdminPassword123!"),
        role=UserRole.ADMIN,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    token = create_access_token(user_id=admin.id, role=admin.role.value)
    return {"Authorization": f"Bearer {token}"}


def test_unauthenticated_user_cannot_create_a_category(client):
    response = client.post("/categories", json={"name": "Plumbing", "description": "Water and pipe repairs"})

    assert response.status_code == 401


def test_admin_can_create_and_list_categories(client, db_session):
    headers = _admin_headers(db_session)

    created = client.post(
        "/categories",
        json={"name": "Plumbing", "description": "Water and pipe repairs"},
        headers=headers,
    )
    listed = client.get("/categories")

    assert created.status_code == 201
    assert created.json()["name"] == "Plumbing"
    assert listed.status_code == 200
    assert [category["name"] for category in listed.json()] == ["Plumbing"]
