from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Enum, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import UserRole
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.customer_model import CustomerProfile
    from app.models.professional_models import ProfessionalProfile

class User(Base):
    __tablename__ = "users"

    id:Mapped[int]=mapped_column(primary_key=True,index=True)

    first_name:Mapped[str]=mapped_column(
        String(100),
        nullable=False)

    last_name:Mapped[str]=mapped_column(
        String(100),
        nullable=False)

    email:Mapped[str]=mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    phone:Mapped[str]=mapped_column(
        String(15),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash:Mapped[str]=mapped_column(
        String(255),
        nullable=False
    )

    role:Mapped[UserRole]=mapped_column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.CUSTOMER
    )

    is_active:Mapped[bool]=mapped_column(
        Boolean,
        default=True
    )

    is_email_verified:Mapped[bool]=mapped_column(
        Boolean,
        default=False
    )

    created_at:Mapped[datetime]=mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),   
    )

    updated_at:Mapped[datetime]=mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),   
        onupdate=func.now(),
    )

    customer_profile: Mapped["CustomerProfile"] = relationship(
        "CustomerProfile",
        back_populates="user",
        uselist=False,
    )

    professional_profile: Mapped["ProfessionalProfile"] = relationship(
        "ProfessionalProfile",
        back_populates="user",
        uselist=False,
    )