from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking_model import Booking
from app.core.enums import BookingStatus, UserRole
from app.models.review_model import Review
from app.models.user_models import User
from app.schemas.review_schema import ReviewCreateRequest, ReviewResponse, RatingSummaryResponse
from app.repositores.review_repositories import (create_review,get_review_by_booking,get_reviews_by_professional, get_professional_rating)

def create_review_service(
        db:Session,
        current_user:User,
        data:ReviewCreateRequest
)->ReviewResponse:

    #only customers can give review
    if current_user.role!=UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can submit review"
        )

    #find booking
    booking=db.get(Booking,data.booking_id)

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Make sure this booking belongs to the customer
    if booking.customer_id!=current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="you can only review your own booking"
        )

    #booking must be completed
    if booking.status!=BookingStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking must be completed to review"
        )

    # Check if booking already has a review
    existing_review = get_review_by_booking(
        db,
        booking.id
        )

    if existing_review:
        raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="This booking has already been reviewed"
    )
    
    #create review
    review=Review(
        booking_id=booking.id,
        customer_id=current_user.id,
        professional_id=booking.professional_id,
        rating=data.rating,
        comment=data.comment
    )
    #save review
    review=create_review(db,review)

    return ReviewResponse.model_validate(review)

def get_reviews_by_professional_service(db:Session,professional_id:int)->list[ReviewResponse]:

    reviews=get_reviews_by_professional(db,professional_id)

    return [
        ReviewResponse.model_validate(review)
        for review in reviews
    ]

def get_professional_rating_service(db:Session,professional_id:int)->RatingSummaryResponse:
    rating_summary=get_professional_rating(db,professional_id)
    return RatingSummaryResponse(rating_summary)



