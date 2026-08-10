from datetime import datetime, timedelta, timezone
from typing import Any 

import jwt
from jwt import InvalidTokenError
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

def decode_access_token(token:str)->dict[str,any]:
    try:
        payload=jwt.decode(
            token,setting.jwt_secret_key,
            algorithms=[setting.jwt_algorithm]
        )
        return payload
    except InvalidTokenError:
        raise ValueError("Invalid or expired token")


