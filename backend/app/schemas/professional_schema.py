from datetime import datetime
from pydantic import BaseModel, ConfigDict,EmailStr, Field

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

class ProfessionalUpdateRequest(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    phone_no: str | None = Field(default=None, min_length=1, max_length=15)
    bio: str | None = Field(default=None, max_length=500)
    hourly_rate: int | None = Field(default=None, ge=0)
    address: str | None = Field(default=None, min_length=1, max_length=255)
    city: str | None = Field(default=None, min_length=1, max_length=100)
    state: str | None = Field(default=None, min_length=1, max_length=100)
    pincode: str | None = Field(default=None, min_length=1, max_length=10)

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
    address: str
    pincode: str
    profile_image: str | None = None
    government_id: str | None = None
    verification_status: VerificationStatus

    model_config = ConfigDict(from_attributes=True)