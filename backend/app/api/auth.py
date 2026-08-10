from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.user_schema import (CustomerRegisterRequest,ProfessionalRegisterRequest,LoginRequest
)
from app.services.auth_service import (register_customer,register_professional,login_user)
from app.utils.jwt import create_access_token

router=APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

@router.post("/register/customer")
def register_customer_api(
        data:CustomerRegisterRequest,
        db:Session=Depends(get_db),
):
    return register_customer(db,data)

@router.post("/register/professional")
def register_professional_api(
    data:ProfessionalRegisterRequest,
    db:Session=Depends(get_db),
):
    return register_professional(db,data)

@router.post("/login")
def login_api(data:LoginRequest,db: Session=Depends(get_db),):
    user=login_user(db,data)

    access_token=create_access_token(
        user_id=user.id,
        role=user.role.value,
    )

    return {
        "access_token":access_token,
        "token_type":"bearer",
    }