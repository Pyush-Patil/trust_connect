from pydantic import BaseModel, EmailStr, Field, model_validator

from app.core.enums import UserRole

class CustomerRegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_no: str
    password: str

    address: str
    city: str
    state: str
    pincode: str


class ProfessionalRegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_no: str
    password: str

    category_id: int
    bio: str
    experience: int
    hourly_rate: int

    address: str
    city: str
    state: str
    pincode: str


class LoginRequest(BaseModel):
    email:EmailStr
    password:str