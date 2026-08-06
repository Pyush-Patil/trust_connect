from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[3]

class Settings(BaseSettings):
    # DB Configuration
    db_host: str
    db_port: int
    db_user: str
    db_password: str
    db_name: str

    # read variables from .env
    model_config = SettingsConfigDict(
        env_file=(BASE_DIR / ".env", ".env", "../.env"),
        env_file_encoding='utf-8',
        extra='ignore'
    )


setting = Settings()