from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.professional_service import get_professional

router=APIRouter()

@router.get("/professionals")
def get_professional_api(db:Session=Depends(get_db)):
    return get_professional(db)