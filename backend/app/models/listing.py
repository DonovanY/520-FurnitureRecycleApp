from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class Listing(Base):
    __tablename__ = "listings"

    id = Column(String, primary_key=True, index=True)
    poster_user_id = Column(String, ForeignKey("profiles.id"), nullable=False, index=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False)
    condition_level = Column(String, nullable=False)
    origin_type = Column(String, nullable=False)
    status = Column(String, nullable=False)

    pickup_notes = Column(Text, nullable=True)
    visible_from = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    reserved_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    is_public = Column(Boolean, nullable=False, default=True)

    city = Column(String, nullable=True)
    location_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    poster = relationship("Profile", back_populates="listings")
    requests = relationship("ItemRequest", back_populates="listing")
    images = relationship(
        "ItemImage",
        back_populates="listing",
        cascade="all, delete-orphan",
    )