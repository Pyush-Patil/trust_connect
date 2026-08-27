from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user_models import User
from app.schemas.review_schema import (
    ReviewCreateRequest,
    ReviewResponse,
    RatingSummaryResponse
)
from app.services.review_service import (create_review_service,get_reviews_by_professional_service,get_professional_rating_service)
from app.dependencies.auth import get_current_user

router=APIRouter(
    tags=["Review"]
)

@router.post("/reviews",response_model=ReviewResponse)
def create_review_api(
    data: ReviewCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_review_service(
        db,
        current_user,
        data
    )

@router.get("/professionals/{professional_id}/reviews",response_model=list[ReviewResponse])
def get_professiona_reviews_api(professional_id:int,db:Session=Depends(get_db)):
    return get_reviews_by_professional_service(db,professional_id)  

@router.get("/professionals/{professional_id}/rating",response_model=RatingSummaryResponse)
def get_professional_rating_api(professional_id:int,db:Session=Depends(get_db)):
    return get_professional_rating_service(db,professional_id)

