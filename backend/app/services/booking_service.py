from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking_model import Booking
from app.models.user_models import User

from app.core.enums import BookingStatus, VerificationStatus,UserRole

from app.repositores.booking_repositores import (create_booking,get_customer_booking,get_professional_booking,get_booking_by_id,update_booking_status,get_all_bookings)
from app.repositores.professional_repository import (get_professional_by_user_id,get_professional_by_id)

from app.schemas.booking_schema import (BookingCreateRequest,BookingResponse)

def create_customer_booking_service(db:Session, current_user:User,data:BookingCreateRequest)->BookingResponse:

    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can create bookings",
        )

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

def get_customer_booking_service(db:Session,current_user:User)->list[BookingResponse]:

    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can view customer bookings",
        )

    bookings=get_customer_booking(db,current_user.id,)
    return [
        BookingResponse.model_validate(booking)
        for booking in bookings
        ]

def get_professional_booking_service(db:Session,current_user:User)->list[BookingResponse]:

    if current_user.role != UserRole.PROFESSIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professionals can view assigned bookings",
        )

    professional=get_professional_by_user_id(db,current_user.id)

    if not professional:
        raise ValueError("Professional not found")

    bookings=get_professional_booking(db,professional.id)

    return [
        BookingResponse.model_validate(booking)
        for booking in bookings
    ]

def accept_booking_service(db:Session,current_user:User,booking_id:int)->BookingResponse:
    #find booking
    booking=get_booking_by_id(db,booking_id)

    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Booking not found")

    #find the professional profile of logged in user
    professional=get_professional_by_user_id(db,current_user.id)

    if not professional:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Professional profile not found")

    #make sure booking belongs to this user
    if booking.professional_id!=professional.id:
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to accept this booking",
        )

    if booking.status!=BookingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending bookings can be accepted",
        )

    #change status
    booking=update_booking_status(db,booking,BookingStatus.ACCEPTED)

    return BookingResponse.model_validate(booking)

def reject_booking_service(
    db: Session,
    current_user: User,
    booking_id: int,
    reason: str,
) -> BookingResponse:

    # Find booking
    booking = get_booking_by_id(
        db,
        booking_id,
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # Find professional profile
    professional = get_professional_by_user_id(
        db,
        current_user.id,
    )

    if not professional:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Professional profile not found",
        )

    # Make sure booking belongs to this professional
    if booking.professional_id != professional.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to reject this booking",
        )

    # Only pending bookings can be rejected
    if booking.status != BookingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending bookings can be rejected",
        )

    # Update booking
    booking.status = BookingStatus.REJECTED
    booking.rejection_reason = reason

    db.commit()
    db.refresh(booking)

    return BookingResponse.model_validate(booking)

def complete_booking_service(db:Session,current_user:User,booking_id:int,)->BookingResponse:

    #find booking
    booking=get_booking_by_id(db,booking_id)

    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Detail not found")

    #find professional
    professional=get_professional_by_user_id(db,current_user.id)

    if not professional:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Professional not found")

    #make sure booking belongs to this professional only
    if booking.professional_id != professional.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Professional not found")

    #only accepted booking can be completed
    if booking.status!=BookingStatus.ACCEPTED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Only accepted bookings can be completed")

    #change status
    booking=update_booking_status(db,booking,BookingStatus.COMPLETED)

    return BookingResponse.model_validate(booking)

def cancel_booking_service(db:Session,current_user:User,booking_id:int)->BookingResponse:
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can cancel bookings",
        )

    booking=get_booking_by_id(db,booking_id)

    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Booking not found")

    # make sure booking belongs to the logged-in customer
    if booking.customer_id!=current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to cancel this booking",)

    # only pending booking can be cancelled
    if booking.status!=BookingStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="only pending bookings can be cancelled")
    #change status 
    booking=update_booking_status(db,booking,BookingStatus.CANCELLED)

    return BookingResponse.model_validate(booking)

def get_booking_details_service(
        db:Session,
        current_user:User,
        booking_id:int
)->BookingResponse:

    booking=get_booking_by_id(db,booking_id)

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    #Admin can view Booking
    if current_user.role==UserRole.ADMIN:
        return BookingResponse.model_validate(booking)

    #customer can view only their bokings
    if current_user.role==UserRole.CUSTOMER:
        if booking.customer_id !=current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view this booking"
            )
        return BookingResponse.model_validate(booking)

    # professional can view their assigned bookings
    if current_user.role==UserRole.PROFESSIONAL:
        professional=get_professional_by_user_id(db,current_user.id)

        if not professional:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Professional profile not found"
            )
        if booking.professional_id !=professional.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view this booking"
            )
        return BookingResponse.model_validate(booking)

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You are not authorized to view this booking"
    )

def get_all_bookings_service(db:Session)->list[BookingResponse]:
    bookings=get_all_bookings(db)

    return [
        BookingResponse.model_validate(booking)
        for booking in bookings
    ]
