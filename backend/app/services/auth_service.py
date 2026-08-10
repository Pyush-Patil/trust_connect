from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session 

from app.models.user_models import User
from app.models.customer_model import CustomerProfile
from app.models.professional_models import ProfessionalProfile
from app.repositores.user_repositories import (
    get_user_by_email,
    get_user_by_phone
)
from app.schemas.user_schema import (
    CustomerRegisterRequest,
    ProfessionalRegisterRequest,
    LoginRequest
)
from app.core.enums import UserRole
from app.utils.security import (hash_password,verify_password)

def register_customer(
        db:Session,
        data:CustomerRegisterRequest
)->User:

    #check existing email
    existing_email=get_user_by_email(db,data.email)

    if existing_email:
        raise ValueError("Email is already registered")

    #check duplicate phone 
    existing_phone=get_user_by_phone(db,data.phone_no)

    if existing_phone:
        raise ValueError("Phone is already registered")

    #hashed password
    hashed_password=hash_password(data.password)

    #create user
    user=User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone_no=data.phone_no,
        password_hash=hashed_password,
        role=UserRole.CUSTOMER,
    )

    try:
        #add user to current transaction 
        db.add(user)

        # Flush sends INSERT to MySQL without committing.
        # This gives us user.id for the profile.
        db.flush()

        # creating Customer profile 
        customer_profile=CustomerProfile(
                user_id=user.id,
                address=data.address,
                city=data.city,
                pincode=data.pincode
            )
        db.add(customer_profile)

        # commit everything together 
        db.commit()

        #refresh the user 
        db.refresh(user)

        return user
    except Exception:
        # Something failed → undo everything
        db.rollback()
        raise

def register_professional(
        db:Session,
        data:ProfessionalRegisterRequest
    )->User:

    #check existing email
    existing_email=get_user_by_email(db,data.email)
    if existing_email:
        raise ValueError("Emial is already registered")

    existing_phone=get_user_by_phone(db,data.phone_no)
    if existing_phone:
        raise ValueError("Phone is already registered")

    hashed_password = hash_password(data.password)

    # Create user
    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone_no=data.phone_no,
        password_hash=hashed_password,
        role=UserRole.PROFESSIONAL
,
    )

    try:
        db.add(user)

        #generate user.id
        db.flush()

        #create professional profile
        professional_profile=ProfessionalProfile(
            user_id=user.id,
            category_id=data.category_id,
            bio=data.bio,
            experience=data.experience,
            hourly_rate=data.hourly_rate,
            address=data.address,
            city=data.city,
            state=data.state,
            pincode=data.pincode,
        )

        db.add(professional_profile)

        #commit both records
        db.commit()

        db.refresh(user)

        return user
    except Exception:
        db.rollback()
        raise

def login_user(db:Session,data:LoginRequest,)->User:

    #find user by email
    user=get_user_by_email(db, data.email)

    if not user:
        raise ValueError("Email not found")

    #verify password
    is_password_valid=verify_password(data.password,user.password_hash)

    if not is_password_valid:
        raise ValueError("Invalid password")

    if not user.is_active:
        raise ValueError("User account is inactive")

    return user

