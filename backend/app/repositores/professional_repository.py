from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.user_models import User
from app.models.category_model import Category
from app.models.professional_models import ProfessionalProfile
from app.core.enums import UserRole,VerificationStatus
from app.models.professional_models import ProfessionalProfile

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

def get_professional_by_id(db:Session,professional_id:int)->ProfessionalProfile | None:
    statement=select(ProfessionalProfile).where(
        professional_id==ProfessionalProfile.id
    )
    return db.scalar(statement)

def verify_professional(db:Session, professional:ProfessionalProfile)->ProfessionalProfile:
    professional.verification_status=VerificationStatus.VERIFIED
    db.commit()
    db.refresh(professional)

    return professional

def get_professional_by_user_id(
    db: Session,
    user_id: int,
) -> ProfessionalProfile | None:

    statement = select(ProfessionalProfile).where(
        ProfessionalProfile.user_id == user_id
    )

    return db.scalar(statement)

def get_pending_professionals(db:Session)->list[ProfessionalProfile]:

    statement=(
        select(ProfessionalProfile)
        .join(User)
        .where(User.role==UserRole.PROFESSIONAL,
               User.is_active==True,
               ProfessionalProfile.verification_status==VerificationStatus.PENDING 
            )
    )

    return list(db.scalars(statement).all())

def search_professionals(
        db:Session,
        category:str | None=None,
        city:str | None=None,
        state:str | None=None,
        min_rate:int | None=None,
        max_rate:int | None=None,
    ):
      statement=(
        select(ProfessionalProfile)
        .join(User, User.id==ProfessionalProfile.user_id)
        .join(Category,Category.id==ProfessionalProfile.category_id)
        .where(
            User.role==UserRole.PROFESSIONAL,
            User.is_active==True,
            ProfessionalProfile.verification_status==VerificationStatus.VERIFIED,
        )
        )
      if category:
        statement=statement.where(Category.name==category)
      if city:
          statement=statement.where(ProfessionalProfile.city==city)
      if state:
          statement=statement.where(ProfessionalProfile.state==state)
      if min_rate is not None:
          statement=statement.where(ProfessionalProfile.hourly_rate>=min_rate)
      if max_rate is not None:
                statement=statement.where(ProfessionalProfile.hourly_rate<=max_rate)

      return list(db.scalars(statement).all())
     
    