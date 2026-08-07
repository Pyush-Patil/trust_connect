from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.user_models import User

class CustomerProfile(Base):
    __tablename__="customer_profiles"

    id:Mapped[int]=mapped_column(
        index=True,
        primary_key=True
    )

    user_id:Mapped[int]=mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
    )

    address:Mapped[str]=mapped_column(
        String(255),
        nullable=False,
    )

    city:Mapped[str]=mapped_column(
        String(100),
        nullable=True
    )

    pincode:Mapped[str]=mapped_column(
        String(10),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user:Mapped["User"]=relationship(
        "User",
        back_populates="customer_profile"
    )