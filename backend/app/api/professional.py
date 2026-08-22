from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.professional_service import (get_professional_service, get_professional_by_id_service,search_professional_service)
from app.dependencies.auth import get_current_user
from app.models.user_models import User
from app.schemas.professional_schema import ProfessionalResponse

router=APIRouter(
    tags=["Professionals"]
)

@router.get("/professionals",response_model=list[ProfessionalResponse])
def get_professional_api(
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user),                    
    ):
    return get_professional_service(db)

@router.get("/search",response_model=list[ProfessionalResponse])
def search_professional_api(
    category:str | None=None,
    city:str | None=None,
    state:str | None=None,
    min_rate:int | None=None,
    max_rate:int | None=None,
    db:Session=Depends(get_db),
):
    return search_professional_service(
        db,category,city,state,min_rate,max_rate,
    )

@router.get("/professionals/{professional_id}", response_model=ProfessionalResponse)
def get_professional_by_id_api(
    professional_id: int,
    db: Session = Depends(get_db),
):
    return get_professional_by_id_service(
        db,
        professional_id,
    ) 

