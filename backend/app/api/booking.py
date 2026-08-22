from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user_models import User
from app.schemas.booking_schema import (BookingCreateRequest, BookingResponse,RejectBookingRequest)
from app.services.booking_service import (
    create_customer_booking_service,
    get_customer_booking_service,
    get_professional_booking_service,
    accept_booking_service,
    reject_booking_service,
    complete_booking_service,
    get_booking_details_service,
    cancel_booking_service,
    )

router=APIRouter(
    tags=["Bookings"]
)

@router.post("/bookings",response_model=BookingResponse)
def create_booking_api(
    data:BookingCreateRequest,
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user)
    ):
    return create_customer_booking_service(db,current_user,data)

@router.get("/bookings/my",response_model=list[BookingResponse])
def get_my_booking_api(db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    return get_customer_booking_service(db,current_user)

@router.get("/bookings/professional",response_model=list[BookingResponse])
def get_professionals_bookings_api(db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    return get_professional_booking_service(db,current_user)

@router.patch("/bookings/{booking_id}/accept",response_model=BookingResponse)
def accept_booking_api(
    booking_id:int,
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user)
    ):
    return accept_booking_service(db,current_user,booking_id,)

@router.patch("/bookings/{booking_id}/reject",response_model=BookingResponse)
def reject_booking_api(
    booking_id:int,
    data:RejectBookingRequest,
    db:Session=Depends(get_db),
    current_user=Depends(get_current_user)
):
    return reject_booking_service(db,current_user,booking_id,data.reason)

@router.patch("/bookings/{booking_id}/complete",response_model=BookingResponse)
def complete_booking_api(booking_id:int,db:Session=Depends(get_db),curret_user:User=Depends(get_current_user)):
    return complete_booking_service(db,curret_user,booking_id)

@router.patch("/bookings/{booking_id}/cancel",response_model=BookingResponse)
def cancel_booking_api(booking_id:int,db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    return cancel_booking_service(db,current_user,booking_id)

@router.get("/bookings/{booking_id}",response_model=BookingResponse)
def get_bookings_api(booking_id:int,db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    return get_booking_details_service(db,current_user,booking_id)

