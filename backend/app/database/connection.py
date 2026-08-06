from sqlalchemy import create_engine
from app.core.config import setting

DATABASE_URL = f"mysql+pymysql://{setting.db_user}:{setting.db_password}@{setting.db_host}:{setting.db_port}/{setting.db_name}"

# create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    echo=True, # prints sql queries in the terminal
    pool_pre_ping=True
)