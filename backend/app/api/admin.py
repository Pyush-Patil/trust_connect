from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_admin
from app.models.user_models import User
from app.services.admin_service import (verify_professional_service,get_pending_professionals_service)
from app.dependencies.auth import get_current_admin
from app.schemas.professional_schema import PendingProfessionalResponse


router = APIRouter()

@router.patch("/admin/professional/{professional_id}/verify")
def verify_professional_api(
    professional_id:int,
    db:Session=Depends(get_db),
    current_admin:User=Depends(get_current_admin),
    ):
      return verify_professional_service(db,professional_id)

@router.get("/admin/professional/pending",response_model=list[PendingProfessionalResponse])
def get_pending_professional_api(db:Session=Depends(get_db),current_user=Depends(get_current_admin)):
      return get_pending_professionals_service(db)