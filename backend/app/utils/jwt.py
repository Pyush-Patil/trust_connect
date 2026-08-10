from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import setting


def create_access_token(
    user_id: int,
    role: str,
) -> str:

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=setting.access_token_expire_minutes
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        setting.jwt_secret_key,
        algorithm=setting.jwt_algorithm,
    )