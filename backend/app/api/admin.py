from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_admin
from app.models.user_models import User
from app.services.admin_service import accept_professional_service
from app.dependencies.auth import get_current_admin


router = APIRouter()

@router.patch("/admin/professional/{professional_id}/accept")
def verify_professional_api(
    professional_id:int,
    db:Session=Depends(get_db),
    current_admin:User=Depends(get_current_admin),
    ):
      return accept_professional_service(db,professional_id)