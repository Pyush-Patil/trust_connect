from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import VerificationStatus
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.category_model import Category
    from app.models.user_models import User


class ProfessionalProfile(Base):
    __tablename__ = "professional_profiles"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"),
        nullable=False,
    )

    bio: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    experience: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    hourly_rate: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    profile_image: Mapped[str] = mapped_column(
        String(255),
        nullable=True,
    )

    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus),
        default=VerificationStatus.PENDING,
        nullable=False,
    )

    address: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    pincode: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    available_from: Mapped[datetime | None] = mapped_column(
    DateTime,
    nullable=True
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

    user: Mapped["User"] = relationship(
        "User",
        back_populates="professional_profile",
    )

    category: Mapped["Category"] = relationship(
        "Category",
        back_populates="professionals",
    )