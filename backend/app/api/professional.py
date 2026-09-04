#file uploads import
from fastapi import UploadFile, File, HTTPException
from pathlib import Path
import shutil
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.professional_service import (get_professional_service, get_professional_by_id_service, search_professional_service, update_professional_profile_service)
from app.dependencies.auth import get_current_user
from app.models.user_models import User
from app.schemas.professional_schema import ProfessionalResponse, ProfessionalUpdateRequest

router=APIRouter(
    tags=["Professionals"]
)

UPLOAD_DIR = Path("uploads")
GOVERNMENT_ID_DIR = UPLOAD_DIR / "government_ids"
PROFILE_PHOTO_DIR = UPLOAD_DIR / "profile_photos"
GOVERNMENT_ID_DIR.mkdir(parents=True, exist_ok=True)
PROFILE_PHOTO_DIR.mkdir(parents=True, exist_ok=True)

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

@router.patch("/professionals/me/profile", response_model=ProfessionalResponse)
def update_my_professional_profile(
    data: ProfessionalUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_professional_profile_service(db, current_user, data)

@router.post("/upload-documents")
async def upload_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    government_id: UploadFile = File(...),
    profile_photo: UploadFile = File(...)
):
    try:
        # Generate unique filenames
        government_id_name = f"{uuid.uuid4()}_{government_id.filename}"
        profile_photo_name = f"{uuid.uuid4()}_{profile_photo.filename}"

        government_id_path = GOVERNMENT_ID_DIR / government_id_name
        profile_photo_path = PROFILE_PHOTO_DIR / profile_photo_name

        # Save files
        with open(government_id_path, "wb") as buffer:
            shutil.copyfileobj(government_id.file, buffer)

        with open(profile_photo_path, "wb") as buffer:
            shutil.copyfileobj(profile_photo.file, buffer)

        if current_user.professional_profile:
            current_user.professional_profile.profile_image = f"/uploads/profile_photos/{profile_photo_name}"
            current_user.professional_profile.government_id = f"/uploads/government_ids/{government_id_name}"
            db.commit()

        return {
            "message": "Documents uploaded successfully",
            "government_id": f"/uploads/government_ids/{government_id_name}",
            "profile_photo": f"/uploads/profile_photos/{profile_photo_name}"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"File upload failed: {str(e)}"
        )