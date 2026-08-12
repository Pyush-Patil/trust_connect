from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user_models import User
from app.schemas.booking_schema import (BookingCreateRequest, BookingResponse)
from app.services.booking_service import create_customer_booking_service

router=APIRouter()

@router.post("/bookings",response_model=BookingResponse)
def create_booking_api(
    data:BookingCreateRequest,
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user)
    ):
    return create_customer_booking_service(db,current_user,data)
