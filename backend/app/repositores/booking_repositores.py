from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.booking_model import Booking



def create_booking(db:Session,booking:Booking)->Booking:
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking

def get_customer_booking(db:Session,customer_id:int)->list[Booking]:
    statement=select(Booking).where(
        Booking.customer_id==customer_id
        )
    return list(db.scalar(statement).all())