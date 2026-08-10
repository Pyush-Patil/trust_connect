from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.user_models import User
from app.models.professional_models import ProfessionalProfile
from app.core.enums import UserRole,VerificationStatus

def get_verified_professional(db:Session,)->list[ProfessionalProfile]:

    statement=(
        select(ProfessionalProfile)
        .join(User,User.id==ProfessionalProfile.user_id)
        .options(selectinload(ProfessionalProfile.user),
                selectinload(ProfessionalProfile.category))
        .where(
            User.role==UserRole.PROFESSIONAL,
            User.is_active==True,
            ProfessionalProfile.verification_status==VerificationStatus.VERIFIED
        )
        )
    return list(db.scalars(statement).all())
        
