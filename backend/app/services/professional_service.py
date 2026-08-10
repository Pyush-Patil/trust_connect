from sqlalchemy.orm import Session

from app.models.professional_models import ProfessionalProfile
from app.repositores.professional_repository import (
    get_verified_professional
)

def get_professional(db:Session,)->list[ProfessionalProfile]:

    professionals=get_verified_professional(db)

    return professionals