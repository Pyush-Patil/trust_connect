from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user_models import User

def get_user_by_email(
        db:Session,
        email:str
        )-> User | None:
        statement=select(User).where(User.email==email)

        return db.scalar(statement)

def get_user_by_phone(
    db: Session,
    phone_no: str,
) -> User | None:
    statement = select(User).where(User.phone_no == phone_no)

    return db.scalar(statement)

def create_user(
    db:Session,
    user:User,
)->User | None:
      db.add(user)
      db.commit()
      db.refresh(user)

      return user

