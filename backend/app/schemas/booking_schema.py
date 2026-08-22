from datetime import date,time, datetime

from pydantic import BaseModel, Field
from app.core.enums import BookingStatus

class BookingCreateRequest(BaseModel):
    professional_id:int
    booking_date:date
    start_time:time
    duration_hours:int= Field(gt=0)
    description:str=Field(min_length=1,max_length=500)

    address:str
    city:str
    state:str
    pincode:str

class BookingResponse(BaseModel):
    id: int
    customer_id: int
    professional_id: int
    booking_date: date
    start_time: time
    duration_hours: int
    hourly_rate: int
    total_amount: int
    description: str
    address: str
    city: str
    state: str
    pincode: str
    status: BookingStatus
    rejection_reason: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class RejectBookingRequest(BaseModel):
    reason: str = Field(
        min_length=1,
        max_length=500,
    )
