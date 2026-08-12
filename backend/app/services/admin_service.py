from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositores.professional_repository import(get_professional_by_id,verify_professional)

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