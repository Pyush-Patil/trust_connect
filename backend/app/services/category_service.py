from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.category_model import Category
from app.repositores.category_repository import create_category, get_category_by_name, list_categories
from app.schemas.category_schema import CategoryCreateRequest, CategoryResponse


def list_categories_service(db: Session) -> list[CategoryResponse]:
    return [CategoryResponse.model_validate(category) for category in list_categories(db)]


def create_category_service(db: Session, data: CategoryCreateRequest) -> CategoryResponse:
    name = data.name.strip()
    if get_category_by_name(db, name):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category already exists")

    category = create_category(db, Category(name=name, description=data.description))
    return CategoryResponse.model_validate(category)
