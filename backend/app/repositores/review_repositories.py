from sqlalchemy import select
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
  
    