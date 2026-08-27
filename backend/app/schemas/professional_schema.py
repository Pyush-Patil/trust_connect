from datetime import datetime
from pydantic import BaseModel, ConfigDict,EmailStr

from app.core.enums import VerificationStatus

# this is for customer to see the professional details 
class ProfessionalResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    category: str
    bio: str
    experience: int
    hourly_rate: int
    profile_image: str | None = None
    verification_status: VerificationStatus
    city: str
    state: str
    average_rating: float | None
    review_count: int
    is_available: bool
    available_from: datetime | None
    created_at: datetime

    model_config=ConfigDict(from_attributes=True)

# this is for admin to verify professional
class PendingProfessionalResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone_no: str
    category: str
    bio: str
    experience: int
    hourly_rate: int
    city: str
    state: str
    verification_status: VerificationStatus

    model_config = ConfigDict(from_attributes=True)