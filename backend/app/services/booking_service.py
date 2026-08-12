from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking_model import Booking
from app.models.user_models import User

from app.core.enums import BookingStatus, VerificationStatus

from app.repositores.booking_repositores import (create_booking)
from app.repositores.professional_repository import get_professional_by_id

from app.schemas.booking_schema import (BookingCreateRequest,BookingResponse)

def create_customer_booking_service(db:Session, current_user:User,data:BookingCreateRequest)->BookingResponse:

    #find professional
    professional=get_professional_by_id(db,data.professional_id)

    #if professional does not exist
    if not professional:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Professional not found")

     #verify professional
    if professional.verification_status!=VerificationStatus.VERIFIED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Professional not verified")

    #professional user's account must be active 
    if not professional.user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Professional account is not inactive")

    #calculate amount 
    total_amount=(professional.hourly_rate * data.duration_hours)

    #create booking 
    # Create booking
    booking = Booking(
        customer_id=current_user.id,
        professional_id=professional.id,
        booking_date=data.booking_date,
        start_time=data.start_time,
        duration_hours=data.duration_hours,
        hourly_rate=professional.hourly_rate,
        total_amount=total_amount,
        description=data.description,
        address=data.address,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        status=BookingStatus.PENDING,
    )

    #save booking 
    booking=create_booking(db,booking,)

    return BookingResponse.model_validate(booking)



      
