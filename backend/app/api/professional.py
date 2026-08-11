from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.professional_service import get_professional
from app.dependencies.auth import get_current_user
from app.models.user_models import User
from app.schemas.professional_schema import ProfessionalResponse

router=APIRouter()

@router.get("/professionals",response_model=list[ProfessionalResponse])
def get_professional_api(
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user),                    
    ):
    return get_professional(db)
    