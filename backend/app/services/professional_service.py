from sqlalchemy.orm import Session

from app.models.professional_models import ProfessionalProfile
from app.repositores.professional_repository import (
    get_verified_professional
)
from app.schemas.professional_schema import ProfessionalResponse

def get_professional(db:Session,)->list[ProfessionalProfile]:

    professionals=get_verified_professional(db)

    return [
         ProfessionalResponse(
            id=professionals.id,
            first_name=professionals.user.first_name,
            last_name=professionals.user.last_name,
            category=professionals.category.name,
            bio=professionals.bio,
            experience=professionals.experience,
            hourly_rate=professionals.hourly_rate,
            profile_image=professionals.profile_image,
            verification_status=professionals.verification_status,
            city=professionals.city,
            state=professionals.state,
            created_at=professionals.created_at,
         )
         for professional in professionals
    ]