from datetime import datetime
from sqlalchemy import ForeignKey,Integer,Text,Datetime
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

class Review(Base):
    __tablename__="reviews"

    id:Mapped[int]=mapped_column(
        primary_key=True,
        index=True,
    )

    booking_id:Mapped[int]=mapped_column(
        ForeignKey("bookings.id"),
        nullable=True,
        unique=True
    )

    customer_id:Mapped[int]=mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    professional_id:Mapped[int]=mapped_column(
        ForeignKey("professional_profiles.id"),
        nullable=False
    )

    rating:Mapped[int]=mapped_column(
        Integer,
        nullable=False
    )

    comment:Mapped[int]=mapped_column(
        Datetime,
        default=datetime.utcnow,
        nullable=False
    )