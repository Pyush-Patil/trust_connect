from sqlalchemy.orm import Session
from fastapi import HTTPException,status
from app.models.professional_models import ProfessionalProfile
from app.repositores.professional_repository import (
    get_verified_professional,
    search_professionals
)
from app.schemas.professional_schema import ProfessionalResponse
from app.repositores.professional_repository import get_professional_by_id
from app.core.enums import VerificationStatus

def get_professional_service(db:Session,)->list[ProfessionalResponse]:

    professionals=get_verified_professional(db)

    response=[]

    for professional in professionals:

        professional_response = ProfessionalResponse(
            id=professional.id,
            first_name=professional.user.first_name,
            last_name=professional.user.last_name,
            category=professional.category.name,
            bio=professional.bio,
            experience=professional.experience,
            hourly_rate=professional.hourly_rate,
            profile_image=professional.profile_image,
            verification_status=professional.verification_status,
            city=professional.city,
            state=professional.state,
            created_at=professional.created_at,
        )

        response.append(professional_response)

    return response

def get_professional_by_id_service(db:Session,professional_id:int)->ProfessionalResponse:
    professional= get_professional_by_id(db,professional_id)

    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found"
        )

    if professional.verification_status!=VerificationStatus.VERIFIED:
        raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Professional not verified"
                )

    return ProfessionalResponse(
        id=professional.id,
        first_name=professional.user.first_name,
        last_name=professional.user.last_name,
        category=professional.category.name,
        bio=professional.bio,
        experience=professional.experience,
        hourly_rate=professional.hourly_rate,
        profile_image=professional.profile_image,
        verification_status=professional.verification_status,
        city=professional.city,
        state=professional.state,
        created_at=professional.created_at,
    )

def search_professional_service(
        db:Session,
        category:str | None=None,
        city:str | None=None,
        state:str | None=None,
        min_rate:int | None=None,
        max_rate:int | None=None,
)->list[ProfessionalResponse]:

    professionals=search_professionals(db,category,city,state,min_rate,max_rate,)

    response=[]
    for professional in professionals:
        professional_response=ProfessionalResponse(
            id=professional.id,
            first_name=professional.user.first_name,
            last_name=professional.user.last_name,
            category=professional.category.name,
            bio=professional.bio,
            experience=professional.experience,
            hourly_rate=professional.hourly_rate,
            profile_image=professional.profile_image,
            verification_status=professional.verification_status,
            city=professional.city,
            state=professional.state,
            created_at=professional.created_at,
        )
        response.append(professional_response)
    return response