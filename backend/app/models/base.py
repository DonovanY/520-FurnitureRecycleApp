"""
Base model with common fields for all entities
"""

from sqlalchemy import Column, Integer, DateTime, func
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class BaseModel(Base):
    """
    Abstract base model with common fields for all entities
    """
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    class Config:
        """SQLAlchemy config for ORM"""
        from_attributes = True
