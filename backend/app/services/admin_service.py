from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositores.professional_repository import(get_professional_by_id,verify_professional)
from app.schemas.professional_schema import PendingProfessionalResponse
from app.repositores.professional_repository import get_pending_professionals

def verify_professional_service(db:Session,professional_id:int):
    professional=get_professional_by_id(db,professional_id)

    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found"
        )
    if professional.verification_status.value=="verified":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Professonal already verfied"
        )

    return verify_professional(db,professional)


def get_pending_professionals_service(db:Session)->list[PendingProfessionalResponse]:


    professionals=get_pending_professionals(db)

    response=[]

    for professional in professionals:
        professional_response=PendingProfessionalResponse(
             id=professional.id,
            first_name=professional.user.first_name,
            last_name=professional.user.last_name,
            email=professional.user.email,
            phone_no=professional.user.phone_no,
            category=professional.category.name,
            bio=professional.bio,
            experience=professional.experience,
            hourly_rate=professional.hourly_rate,
            city=professional.city,
            state=professional.state,
            verification_status=professional.verification_status,
        )
        response.append(professional_response)

    return response

