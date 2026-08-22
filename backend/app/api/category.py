from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_admin
from app.schemas.category_schema import CategoryCreateRequest, CategoryResponse
from app.services.category_service import create_category_service, list_categories_service


router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories_api(db: Session = Depends(get_db)):
    return list_categories_service(db)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category_api(
    data: CategoryCreateRequest,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    return create_category_service(db, data)
