from sqlalchemy.orm import sessionmaker
from app.database.connection import engine

Sessionlocal=sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)


#Dependency for FASTAPI
def get_db():
    db=Sessionlocal()
    try:
        yield db
    finally:
        db.close()