# Trust Connect

A FastAPI backend for connecting customers with verified service professionals. Customers can discover professionals and manage bookings; professionals can accept, reject, and complete assigned work; admins verify professional accounts.

## Stack

- FastAPI and Pydantic v2
- SQLAlchemy 2.0 with MySQL/PyMySQL
- Alembic migrations
- JWT bearer authentication and Argon2 password hashing

## Run locally

1. Create a MySQL database.
2. In the project root, create a `.env` file with:

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=trust_connect
   JWT_SECRET_KEY=replace_with_a_long_random_secret
   ```

3. Install dependencies and apply migrations:

   ```powershell
   .\.venv\Scripts\pip install -r requirements.txt
   .\.venv\Scripts\alembic upgrade head
   ```

4. Start the API:

   ```powershell
   Set-Location backend
   ..\.venv\Scripts\uvicorn app.main:app --reload
   ```

Open `http://127.0.0.1:8000/docs` for the interactive API documentation.

## Main API flow

1. An administrator creates service categories through `POST /categories` and verifies registered professional profiles.
2. Customers register, log in, browse `/professionals` or `/search`, and create bookings.
3. The assigned professional accepts or rejects each pending booking, then completes accepted work.
4. Customers can cancel a pending booking. Both parties can view only their own booking records.

## Endpoint groups

- `/auth`: registration, login, and current-user profile
- `/categories`, `/professionals`, and `/search`: service setup and verified-professional discovery
- `/bookings`: create, list, inspect, accept, reject, complete, and cancel bookings
- `/admin`: pending professional verification and booking overview

Authenticated endpoints use `Authorization: Bearer <access_token>`.
