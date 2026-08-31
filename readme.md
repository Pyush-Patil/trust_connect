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