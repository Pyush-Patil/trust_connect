from app.database.session import Sessionlocal
from app.models.user_models import User
from app.core.enums import UserRole
from app.utils.security import hash_password

db=Sessionlocal()

try:
    admin_email="admin@trustconnect.com"
    # check if user already exists or not 
    existing_admin=db.query(User).filter(User.email==admin_email).first()

    if existing_admin:
        print("Admin already exists")
    else:
        admin = User(
            first_name="Trust",
            last_name="Admin",
            email=admin_email,
            phone_no="9999999999",
            password_hash=hash_password("Admin@123"),
            role=UserRole.ADMIN,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("Admin created successfully")
        print("Emial:",admin_email)
finally:
    db.close()