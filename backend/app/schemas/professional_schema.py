from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.core.enums import VerificationStatus

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
    created_at: datetime

    model_config=ConfigDict(from_attributes=True)
