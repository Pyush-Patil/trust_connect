from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import date

from app.models.booking_model import Booking
from app.core.enums import BookingStatus


def create_booking(db:Session,booking:Booking)->Booking:
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking

def get_customer_booking(db:Session,customer_id:int)->list[Booking]:
    statement=select(Booking).where(
        Booking.customer_id==customer_id
        )
    return list(db.scalars(statement).all())

def get_professional_booking(db:Session,professional_id:int)->list[Booking]:
    statement=select(Booking).where(
        Booking.professional_id==professional_id
    )
    return list(db.scalars(statement).all())

def get_booking_by_id(
        db:Session,
        booking_id:int,
)->Booking | None:
    statement=select(Booking).where(Booking.id==booking_id)

    return db.scalar(statement)

def update_booking_status(db:Session,booking:Booking,status:BookingStatus,)->Booking:
    booking.status=status
    db.commit()
    db.refresh(booking)

    return booking

def get_all_bookings(db: Session):
    return list(db.scalars(select(Booking)).all())

def get_active_booking_for_date(db:Session,professional_id:int,booking_date:date,)->list[Booking]:
    statement=select(Booking).where(
        Booking.professional_id==professional_id,
        Booking.booking_date==booking_date,
        Booking.status.in_([
            BookingStatus.PENDING,
            BookingStatus.ACCEPTED
        ]),
    )

    return list(db.scalars(statement).all())