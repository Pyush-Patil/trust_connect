from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass

from app.models.user_models import User
from app.models.category_model import Category
from app.models.professional_models import ProfessionalProfile
from app.models.customer_model import CustomerProfile