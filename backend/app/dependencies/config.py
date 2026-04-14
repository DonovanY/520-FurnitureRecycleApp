from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

class Settings(BaseSettings):
    database_url: str
    supabase_url: str
    supabase_anon_key: str
    supabase_jwt_secret: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()