from pathlib import Path
from urllib.request import Request, urlopen

from app.core.enums import UserRole, VerificationStatus
from app.database.session import Sessionlocal
from app.models.category_model import Category
from app.models.professional_models import ProfessionalProfile
from app.models.user_models import User
from app.utils.security import hash_password


ROOT = Path(__file__).resolve().parent
PHOTO_DIR = ROOT / "uploads" / "profile_photos"
PHOTO_DIR.mkdir(parents=True, exist_ok=True)

CATEGORIES = {
    "AC & Appliance": "AC repair, appliance servicing and installation",
    "Electrician": "Wiring, repairs, switches and electrical maintenance",
    "Plumber": "Leaks, fittings, pipes and water systems",
    "Carpenter": "Furniture repair, fittings and woodwork",
    "Painter": "Interior and exterior painting services",
    "Painting": "Interior, exterior and waterproof painting",
    "Deep Cleaning": "Home, kitchen, bathroom and sofa cleaning",
    "AC Technician": "Air conditioner installation and repair",
}

PROFESSIONALS = [
    ("Aarav", "Mehta", "aarav.mehta@trustconnect.demo", "9000001001", "Electrician", "Bengaluru", "KA", "560001", 7, 499, "Certified electrician handling residential wiring, fixtures and safety checks.", 7285965),
    ("Meera", "Nair", "meera.nair@trustconnect.demo", "9000001002", "Painter", "Chennai", "TN", "600001", 5, 399, "Reliable interior and exterior painting with careful preparation and finishing.", 7285965),
    ("Kabir", "Shah", "kabir.shah@trustconnect.demo", "9000001003", "Plumber", "Mumbai", "MH", "400001", 9, 449, "Experienced plumber for leak detection, fittings and bathroom maintenance.", 6419128),
    ("Ishita", "Rao", "ishita.rao@trustconnect.demo", "9000001004", "Carpenter", "Hyderabad", "TS", "500001", 6, 549, "Custom furniture repairs, doors, hinges and precise home fittings.", 5974413),
    ("Rohan", "Kapoor", "rohan.kapoor@trustconnect.demo", "9000001005", "Painting", "Delhi", "DL", "110001", 8, 599, "Interior and exterior painting with neat preparation and finishing.", 7218683),
    ("Sana", "Khan", "sana.khan@trustconnect.demo", "9000001006", "Deep Cleaning", "Pune", "MH", "411001", 4, 349, "Detailed home, kitchen and bathroom cleaning with professional equipment.", 6197121),
    ("Dev", "Patel", "dev.patel@trustconnect.demo", "9000001007", "AC & Appliance", "Ahmedabad", "GJ", "380001", 10, 649, "AC servicing, appliance diagnostics and installation for busy households.", 33671149),
    ("Anika", "Das", "anika.das@trustconnect.demo", "9000001008", "AC Technician", "Kolkata", "WB", "700001", 3, 299, "Fast AC installation, servicing and cooling issue support for homes.", 33671149),
    ("Vikram", "Joshi", "vikram.joshi@trustconnect.demo", "9000001009", "Carpenter", "Jaipur", "RJ", "302001", 12, 699, "Specialist in furniture restoration, modular fittings and wood finishing.", 5974413),
    ("Nisha", "Bose", "nisha.bose@trustconnect.demo", "9000001010", "Electrician", "Kochi", "KL", "682001", 5, 449, "Home electrical repairs and maintenance with clear upfront estimates.", 7285965),
]


def download_photo(photo_id: int, filename: str) -> str:
    path = PHOTO_DIR / filename
    if not path.exists():
        url = f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=600"
        request = Request(url, headers={"User-Agent": "trust-connect-seeder/1.0"})
        with urlopen(request, timeout=30) as response, path.open("wb") as output:
            output.write(response.read())
    return f"/uploads/profile_photos/{filename}"


def write_demo_document(filename: str, name: str, category: str) -> str:
    path = ROOT / "uploads" / "government_ids" / filename
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text(
            "TRUST CONNECT DEMO DOCUMENT\n"
            "For verification UI testing only.\n"
            f"Professional: {name}\n"
            f"Category: {category}\n",
            encoding="utf-8",
        )
    return f"/uploads/government_ids/{filename}"


def seed() -> None:
    db = Sessionlocal()
    created = 0
    skipped = 0
    try:
        category_rows = {}
        for name, description in CATEGORIES.items():
            category = db.query(Category).filter(Category.name == name).first()
            if category is None:
                category = Category(name=name, description=description)
                db.add(category)
                db.flush()
            category_rows[name] = category

        for first_name, last_name, email, phone, category_name, city, state, pincode, experience, hourly_rate, bio, photo_id in PROFESSIONALS:
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                if existing_user.professional_profile:
                    existing_user.professional_profile.category_id = category_rows[category_name].id
                    existing_user.professional_profile.bio = bio
                    existing_user.professional_profile.government_id = write_demo_document(
                        f"seed-{email.split('@')[0]}-government-id.txt",
                        f"{first_name} {last_name}",
                        category_name,
                    )
                
                skipped += 1
                continue

            filename = f"seed-{email.split('@')[0]}.jpg"
            image_url = download_photo(photo_id, filename)
            government_id_url = write_demo_document(
                f"seed-{email.split('@')[0]}-government-id.txt",
                f"{first_name} {last_name}",
                category_name,
            )
            user = User(
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone_no=phone,
                password_hash=hash_password("Demo@123"),
                role=UserRole.PROFESSIONAL,
                is_active=True,
            )
            db.add(user)
            db.flush()
            db.add(ProfessionalProfile(
                user_id=user.id,
                category_id=category_rows[category_name].id,
                bio=bio,
                experience=experience,
                hourly_rate=hourly_rate,
                profile_image=image_url,
                government_id=government_id_url,
                verification_status=VerificationStatus.PENDING,
                address=f"{city} service area",
                city=city,
                state=state,
                pincode=pincode,
                is_available=True,
            ))
            created += 1

        db.commit()
        print(f"Seed complete: {created} professionals created, {skipped} already existed.")
        print("All seeded professionals are pending admin verification.")
        print("Demo password for seeded accounts: Demo@123")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
