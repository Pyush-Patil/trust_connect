from sqlalchemy.orm import sessionmaker, Session
from app.database.connection import engine
from _collections_abc import Generator


Sessionlocal=sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)


#Dependency for FASTAPI
def get_db()->Generator[Session, None, None]:
    db=Sessionlocal()
    try:
        yield db
    finally:
        db.close()


