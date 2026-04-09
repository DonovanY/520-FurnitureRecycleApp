from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # These names must match your .env file keys
    SUPABASE_JWT_SECRET: str
    ALGORITHM: str = "HS256"
    
    # Loads from .env automatically
    model_config = SettingsConfigDict(env_file=".env")

@lru_cache()
def get_settings():
    return Settings()