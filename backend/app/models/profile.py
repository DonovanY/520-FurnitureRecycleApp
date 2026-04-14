from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    listings = relationship("Listing", back_populates="poster")