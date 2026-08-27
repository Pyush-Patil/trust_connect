from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.review_model import Review

def create_review(db:Session,review:Review)->Review:
    db.add(review)
    db.commit()
    db.refresh(review)

    return review

def get_reviews_by_professional(
        db:Session,
        professional_id:int,
)->list[Review]:
    return list(
        db.scalars(
            select(Review).where(
                Review.professional_id==professional_id
            )
        ).all()
    )

def get_review_by_booking(db:Session,booking_id:int)->Review | None:
    return db.scalar(
        select(Review).where(
            Review.booking_id==booking_id
        )
    )

def get_professional_rating(
    db: Session,
    professional_id: int
):
    result = db.execute(
        select(
            func.avg(Review.rating),
            func.count(Review.id)
        ).where(
            Review.professional_id == professional_id
        )
    ).one()

    average_rating, review_count = result

    return {
        "average_rating": round(float(average_rating), 2)
        if average_rating is not None
        else 0.0,
        "review_count": review_count
    }