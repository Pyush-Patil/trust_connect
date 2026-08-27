from pydantic import BaseModel,Field,ConfigDict
from datetime import datetime

class ReviewCreateRequest(BaseModel):
    booking_id:int
    rating:int=Field(...,ge=1,le=5)
    comment:str | None=None

class ReviewResponse(BaseModel):
    id:int
    booking_id:int
    customer_id:int
    professional_id:int
    rating:int
    comment:str| None
    created_at:datetime

    model_config = ConfigDict(from_attributes=True)

class RatingSummaryResponse(BaseModel):
    average_rating:float
    review_count:int
