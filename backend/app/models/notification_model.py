from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base

class Notification(Base):
    __tablename__="notifications"

    id:Mapped[int]=mapped_column(
        primary_key=True,
        index=True
    )

    user_id:Mapped[int]=mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    title:Mapped[str]=mapped_column(
        String(200),
        nullable=False
    )

    message:Mapped[str]=mapped_column(
        Text,
        nullable=False
    )

    is_read:Mapped[bool]=mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at:Mapped[datetime]=mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

