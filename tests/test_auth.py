def test_customer_can_register_and_log_in(client, customer_payload):
    registration = client.post("/auth/register/customer", json=customer_payload)

    assert registration.status_code == 200
    assert registration.json()["email"] == customer_payload["email"]
    assert registration.json()["role"] == "customer"

    login = client.post(
        "/auth/login",
        json={"email": customer_payload["email"], "password": customer_payload["password"]},
    )

    assert login.status_code == 200
    assert login.json()["token_type"] == "bearer"
    assert login.json()["access_token"]


def test_duplicate_customer_email_is_rejected(client, customer_payload):
    assert client.post("/auth/register/customer", json=customer_payload).status_code == 200

    response = client.post("/auth/register/customer", json=customer_payload)

    assert response.status_code == 409
    assert response.json()["detail"] == "Email is already registered"


def test_profile_requires_a_valid_access_token(client):
    response = client.get("/auth/me")

    assert response.status_code == 401
